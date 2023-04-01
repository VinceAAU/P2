<?php
$FileName=$_FILES['fuResume']['name'];
$TmpName=$_FILES['fuResume']['tmp_name'];

move_uploaded_file($TmpName,$FileName);

echo("File Uploaded Successfully")
?>
