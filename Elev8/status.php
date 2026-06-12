<?php
require_once __DIR__ . '/php/db_config.php';
?>

<!DOCTYPE html>
<html>
<head>
<title>Database Status - ELEV8</title>
<link href="css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<style>
  .status-card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(40, 167, 69, 0.3);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .status-number {
    font-size: 48px;
    color: #28a745;
    font-weight: bold;
  }
  .tech-stack {
    background: rgba(0, 0, 0, 0.5);
    padding: 20px;
    border-radius: 8px;
    margin-top: 30px;
  }
</style>
</head>
<body>

<video class="background-video" autoplay muted loop>
  <source src="imgs&vid/background.mp4" type="video/mp4">
</video>

<nav class="navbar navbar-expand-lg navbar-dark fixed-top">
  <div class="container">
    <a class="navbar-brand" href="index.html">
    <img src="imgs&vid/logo.png" class="logo" alt="logo">
</a>
    <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="menu">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="submissions.php">View Data</a></li>
        <li class="nav-item"><a class="nav-link" href="feedback.html">Feedback</a></li>
      </ul>
    </div>
  </div>
</nav>

<div class="container mt-5 pt-5">
  <div class="row">
    <div class="col-md-12">
      <h1 class="text-success mb-5">Database Status & Setup Information</h1>

      <div class="row">
        <div class="col-md-6">
          <div class="status-card">
            <h3 class="text-success mb-3">✅ Database Connected</h3>
            <p><strong>Type:</strong> MySQL (XAMPP phpMyAdmin)</p>
            <p><strong>Database:</strong> elev8_db</p>
            <p><strong>Status:</strong> <span class="text-success">Active</span></p>
            <?php
            try {
              $pdo = getDbConnection();
              $result = $pdo->query("SELECT COUNT(*) as count FROM submissions");
              $count = $result->fetch(PDO::FETCH_ASSOC)['count'];
              echo '<p><strong>Total Submissions:</strong> <span class="status-number">' . $count . '</span></p>';
            } catch (Exception $e) {
              echo '<p class="text-danger">Error: ' . $e->getMessage() . '</p>';
            }
            ?>
          </div>
        </div>

        <div class="col-md-6">
          <div class="status-card">
            <h3 class="text-success mb-3">⚙️ CRUD Operations</h3>
            <p><strong>CREATE:</strong> ✅ Implemented (Insert data via feedback form)</p>
            <p><strong>READ:</strong> ✅ Implemented (View all submissions)</p>
            <p><strong>UPDATE:</strong> ✅ Ready (Backend available)</p>
            <p><strong>DELETE:</strong> ✅ Implemented (Remove submissions)</p>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-12">
          <div class="status-card">
            <h3 class="text-success mb-3">📁 PHP Files Created</h3>
            <table class="table table-dark table-sm">
              <thead class="table-success">
                <tr>
                  <th>File</th>
                  <th>Purpose</th>
                  <th>Method</th>
                  <th>Operation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>db_config.php</td>
                  <td>Database connection & initialization</td>
                  <td>-</td>
                  <td>Setup</td>
                </tr>
                <tr>
                  <td>create_submission.php</td>
                  <td>Insert new submissions</td>
                  <td>POST</td>
                  <td>CREATE</td>
                </tr>
                <tr>
                  <td>read_submissions.php</td>
                  <td>Retrieve submissions from database</td>
                  <td>GET</td>
                  <td>READ</td>
                </tr>
                <tr>
                  <td>update_submission.php</td>
                  <td>Update existing submissions</td>
                  <td>POST</td>
                  <td>UPDATE</td>
                </tr>
                <tr>
                  <td>delete_submission.php</td>
                  <td>Delete submissions</td>
                  <td>POST</td>
                  <td>DELETE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tech-stack">
        <h3 class="text-success mb-3">🛠️ Tech Stack</h3>
        <p><strong>Frontend:</strong> HTML5, CSS3, JavaScript, Bootstrap 5.3.2 (Local)</p>
        <p><strong>Backend:</strong> PHP 8.5.1</p>
        <p><strong>Database:</strong> MySQL (phpMyAdmin)</p>
        <p><strong>APIs:</strong> RESTful JSON responses</p>
      </div>

      <div class="alert alert-info mt-4">
        <h5>Ready to Test?</h5>
        <p>1. Fill out the <a href="feedback.html" class="alert-link">Feedback Form</a> to CREATE a submission</p>
        <p>2. Go to <a href="submissions.php" class="alert-link">View Data</a> to READ all submissions</p>
        <p>3. Click DELETE to remove a submission</p>
      </div>

    </div>
  </div>
</div>

<footer class="mt-5">
  © 2026 ELEV8 | Database Integration Complete
</footer>

<script src="js/bootstrap.bundle.min.js"></script>
</body>
</html>