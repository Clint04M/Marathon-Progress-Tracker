<?php
// DB connection params
$host = "localhost";
$user = "root";
$pass = "";
$db = "marathon_app";

function validate($data) {
    foreach (['totalDistance','coveredDistance','elapsedTime','targetTime','currentSpeed','timestamp'] as $k) {
        if (!isset($data[$k])) return false;
    }
    if (!is_numeric($data['totalDistance']) || !is_numeric($data['coveredDistance']) ||
        !is_numeric($data['elapsedTime']) || !is_numeric($data['targetTime']) ||
        !is_numeric($data['currentSpeed'])) {
        return false;
    }
    return true;
}

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !validate($data)) {
    echo json_encode(['status'=>'error','message'=>'Invalid data']);
    exit;
}


$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['status'=>'error','message'=>'DB Connect error']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO race_data
    (total_distance, covered_distance, elapsed_time, target_time, current_speed, required_speed, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("dddddds",
    $data['totalDistance'],
    $data['coveredDistance'],
    $data['elapsedTime'],
    $data['targetTime'],
    $data['currentSpeed'],
    $data['requiredSpeed'],
    $data['timestamp']);
$stmt->execute();
$stmt->close();
$conn->close();

// Save to file (append for future analysis)
$line = implode(",", [
    $data['timestamp'],
    $data['totalDistance'],
    $data['coveredDistance'],
    $data['elapsedTime'],
    $data['targetTime'],
    $data['currentSpeed'],
    $data['requiredSpeed'] ?? 'N/A'
]) . "\n";
file_put_contents('race_history.txt', $line, FILE_APPEND);

echo json_encode(['status'=>'success']);
?>