<?php
require_once __DIR__ . '/php/db_config.php';

// Fetch all submissions from database
$pdo = getDbConnection();
$stmt = $pdo->query("SELECT * FROM submissions ORDER BY created_at DESC");
$submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html>
<head>
<title>View Submissions - ELEV8</title>
<link href="css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<style>
  .submissions-table {
    margin-top: 2rem;
  }
  .action-buttons {
    display: flex;
    gap: 5px;
  }
  .action-buttons button {
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
  }

  /* Keep modal details readable against Bootstrap's light modal background */
  #viewModal .modal-content,
  #viewModal .modal-body,
  #viewModal .modal-body p,
  #viewModal .modal-body strong {
    color: #1E5A63 !important;
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
        <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
        <li class="nav-item"><a class="nav-link" href="programs.html">Programs</a></li>
        <li class="nav-item"><a class="nav-link" href="gallery.html">Gallery</a></li>
        <li class="nav-item"><a class="nav-link" href="feedback.html">Feedback</a></li>
        <li class="nav-item"><a class="nav-link" href="submissions.php">View Data</a></li>
      </ul>
    </div>
  </div>
</nav>

<div class="container mt-5 pt-5">
  <div class="row">
    <div class="col-md-12">
      <h2 class="text-success mb-4">Feedback Submissions</h2>

      <?php if (count($submissions) > 0): ?>
        <div class="table-responsive submissions-table">
          <table class="table table-dark table-striped table-hover">
            <thead class="table-success">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($submissions as $submission): ?>
                <tr>
                  <td><?php echo htmlspecialchars($submission['id']); ?></td>
                  <td><?php echo htmlspecialchars($submission['firstName'] . ' ' . $submission['lastName']); ?></td>
                  <td><?php echo htmlspecialchars($submission['email']); ?></td>
                  <td><?php echo htmlspecialchars($submission['phone']); ?></td>
                  <td><?php echo htmlspecialchars($submission['category'] ?? 'N/A'); ?></td>
                  <td><?php echo htmlspecialchars($submission['rating'] . '/5'); ?></td>
                  <td><?php echo date('M d, Y', strtotime($submission['created_at'])); ?></td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-info btn-sm" onclick="viewSubmission(<?php echo $submission['id']; ?>)">View</button>
                      <button class="btn btn-danger btn-sm" onclick="deleteSubmission(<?php echo $submission['id']; ?>)">Delete</button>
                    </div>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php else: ?>
        <div class="alert alert-info" role="alert">
          No submissions found. <a href="feedback.html" class="alert-link">Submit your feedback</a>
        </div>
      <?php endif; ?>

    </div>
  </div>
</div>

<!-- View Modal -->
<div class="modal fade" id="viewModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-info text-white">
        <h5 class="modal-title">Submission Details</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body" id="modalBody">
        <!-- Details will be loaded here -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<footer>
  <p>© 2026 ELEV8 | Goa</p>
  <div class="social-links">
    <a href="https://www.instagram.com/elev8.goa/" target="_blank" rel="noopener noreferrer">Instagram</a>
    <a href="https://wa.me/917066131474" target="_blank" rel="noopener noreferrer">WhatsApp</a>
  </div>
</footer>

<script src="js/bootstrap.bundle.min.js"></script>
<script>
  function viewSubmission(id) {
    fetch('php/read_submissions.php?id=' + id)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const sub = data.data;
          const html = `
            <p><strong>Name:</strong> ${sub.firstName} ${sub.middleName} ${sub.lastName}</p>
            <p><strong>DOB:</strong> ${sub.dob}</p>
            <p><strong>Email:</strong> ${sub.email}</p>
            <p><strong>Phone:</strong> ${sub.phone}</p>
            <p><strong>Category:</strong> ${sub.category || 'N/A'}</p>
            <p><strong>Rating:</strong> ${sub.rating}/5</p>
            <p><strong>Feedback:</strong> ${sub.feedback}</p>
            <p><strong>Submitted:</strong> ${new Date(sub.created_at).toLocaleString()}</p>
          `;
          document.getElementById('modalBody').innerHTML = html;
          new bootstrap.Modal(document.getElementById('viewModal')).show();
        }
      })
      .catch(error => console.error('Error:', error));
  }

  function deleteSubmission(id) {
    if (confirm('Are you sure you want to delete this submission?')) {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('_method', 'DELETE');

      fetch('php/delete_submission.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Submission deleted successfully!');
          location.reload();
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => console.error('Error:', error));
    }
  }
</script>
<script>
// highlight current page link in navbar
  document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    const current = window.location.pathname.split('/').pop();
    links.forEach(link => {
      if (link.getAttribute('href') === current) {
        link.classList.add('active');
      }
    });
  });
</script>
</body>
</html>