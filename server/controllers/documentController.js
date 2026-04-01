const db = require('../config/db');
const { generateFileHash } = require('../utils/hashUtil');
const { createBlockHash } = require('../utils/blockchainUtil');

// ==========================
// ACTIVITY LOGGER
// ==========================
const logActivity = (user_id, action_type, action_details) => {
  const sql = `
    INSERT INTO activity_logs (user_id, action_type, action_details)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [user_id, action_type, action_details], (err) => {
    if (err) {
      console.error("Activity log error:", err);
    }
  });
};

// ==========================
// UPLOAD DOCUMENT + BLOCKCHAIN
// ==========================
const uploadDocument = async (req, res) => {
  const { user_id, doc_title } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const file = req.file;

  try {
    const fileHash = await generateFileHash(file.path);
    console.log("Generated File Hash:", fileHash);

    const docSql = `
      INSERT INTO documents (user_id, doc_title, file_name, file_type, file_size, file_path, document_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      docSql,
      [
        user_id,
        doc_title,
        file.originalname,
        file.mimetype,
        file.size,
        file.path,
        fileHash,
        'ACTIVE'
      ],
      (err, docResult) => {
        if (err) {
          console.error("Document Insert Error:", err);
          return res.status(500).json({ message: 'Document upload failed', error: err });
        }

        const doc_id = docResult.insertId;

        db.query(
          'SELECT * FROM blockchain ORDER BY block_id DESC LIMIT 1',
          (err, blocks) => {
            if (err) {
              console.error("Blockchain Fetch Error:", err);
              return res.status(500).json({ message: 'Blockchain fetch failed', error: err });
            }

            const previousHash =
              blocks.length > 0 ? blocks[0].current_hash : 'GENESIS_BLOCK';

            const timestamp = new Date().toISOString();
            const currentHash = createBlockHash(previousHash, fileHash, timestamp);

            const blockSql = `
              INSERT INTO blockchain (doc_id, previous_hash, current_hash, file_hash, block_data)
              VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
              blockSql,
              [
                doc_id,
                previousHash,
                currentHash,
                fileHash,
                `Document: ${file.originalname}`
              ],
              (err) => {
                if (err) {
                  console.error("Blockchain Insert Error:", err);
                  return res.status(500).json({ message: 'Block creation failed', error: err });
                }

                // ✅ ACTIVITY LOGS
                logActivity(user_id, "UPLOAD", `Uploaded document: ${file.originalname}`);
                logActivity(user_id, "BLOCK_CREATED", `Blockchain block created for document: ${file.originalname}`);

                return res.status(201).json({
                  message: 'Document uploaded & block created',
                  fileHash,
                  blockHash: currentHash
                });
              }
            );
          }
        );
      }
    );

  } catch (error) {
    console.error("Hash Generation Error:", error);
    return res.status(500).json({ message: 'Hash generation failed', error });
  }
};

// ==========================
// INTEGRITY CHECK
// ==========================
const checkDocumentIntegrity = async (req, res) => {
  const { doc_id } = req.params;

  const sql = 'SELECT * FROM documents WHERE doc_id = ?';

  db.query(sql, [doc_id], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = results[0];

    try {
      const currentHash = await generateFileHash(document.file_path);

      if (currentHash === document.document_hash) {

        // ✅ LOG VALID CHECK
        logActivity(document.user_id, "INTEGRITY_CHECK", `Integrity check passed for document: ${document.file_name}`);

        return res.status(200).json({
          message: 'Document is valid',
          status: 'VALID',
          storedHash: document.document_hash,
          currentHash: currentHash
        });

      } else {

        db.query(
          'UPDATE documents SET status = ? WHERE doc_id = ?',
          ['TAMPERED', doc_id]
        );

        // ✅ LOG TAMPER
        logActivity(document.user_id, "TAMPER_DETECTED", `Tampering detected in document: ${document.file_name}`);

        return res.status(200).json({
          message: 'Document has been tampered!',
          status: 'TAMPERED',
          storedHash: document.document_hash,
          currentHash: currentHash
        });
      }

    } catch (error) {
      return res.status(500).json({ message: 'Integrity check failed', error });
    }
  });
};

// ==========================
// GET USER DOCUMENTS
// ==========================
const getUserDocuments = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT doc_id, doc_title, file_name, file_path, uploaded_at, status, document_hash
    FROM documents
    WHERE user_id = ?
    ORDER BY uploaded_at DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch documents', error: err });
    }

    return res.status(200).json(results);
  });
};

// ==========================
// GET BLOCKCHAIN DATA
// ==========================
const getBlockchainData = (req, res) => {
  const sql = `
    SELECT block_id, doc_id, previous_hash, current_hash, file_hash, block_data, timestamp
    FROM blockchain
    ORDER BY block_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch blockchain data', error: err });
    }

    return res.status(200).json(results);
  });
};

// ==========================
// GET ACTIVITY LOGS
// ==========================
const getActivityLogs = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT log_id, action_type, action_details, created_at
    FROM activity_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch activity logs', error: err });
    }

    return res.status(200).json(results);
  });
};

const getDashboardStats = (req, res) => {
  const { user_id } = req.params;

  const statsSql = `
    SELECT
      COUNT(*) AS totalDocuments,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeDocuments,
      SUM(CASE WHEN status = 'TAMPERED' THEN 1 ELSE 0 END) AS tamperedDocuments
    FROM documents
    WHERE user_id = ?
  `;

  const blocksSql = `
    SELECT COUNT(*) AS totalBlocks
    FROM blockchain
    WHERE doc_id IN (
      SELECT doc_id FROM documents WHERE user_id = ?
    )
  `;

  const recentSql = `
    SELECT action_type, action_details, created_at
    FROM activity_logs
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `;

  db.query(statsSql, [user_id], (err, statsResult) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch document stats", error: err });
    }

    db.query(blocksSql, [user_id], (err, blocksResult) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch block stats", error: err });
      }

      db.query(recentSql, [user_id], (err, recentResult) => {
        if (err) {
          return res.status(500).json({ message: "Failed to fetch recent activity", error: err });
        }

        return res.status(200).json({
          stats: {
            totalDocuments: statsResult[0].totalDocuments || 0,
            activeDocuments: statsResult[0].activeDocuments || 0,
            tamperedDocuments: statsResult[0].tamperedDocuments || 0,
            totalBlocks: blocksResult[0].totalBlocks || 0
          },
          recentActivity: recentResult
        });
      });
    });
  });
};


// ==========================
// EXPORTS
// ==========================
module.exports = {
  uploadDocument,
  checkDocumentIntegrity,
  getUserDocuments,
  getBlockchainData,
  getActivityLogs,
  getDashboardStats
};