<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Redirecting to handle.php...</title>
</head>
<body>
<?php 

$url = "https://www.nytimes.com/puzzles/spelling-bee/";
$html = file_get_contents($url);

?>
<form id="redirectForm" action="handle.php" method="POST">
    <textarea type="hidden" name="src" id="htmlContent"  ><?php echo $html;?></textarea>
</form>

<script>
window.onload = function() {
    // Fetch HTML content from the URL
    var url = "https://www.nytimes.com/puzzles/spelling-bee/";

    document.getElementById("redirectForm").submit();

};
</script>
</body>
</html>