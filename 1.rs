use std::process::Command;
use std::fs;

fn main() {
    // Command Injection
    let user_input = std::env::args()
        .nth(1)
        .unwrap_or("ls".to_string());

    Command::new("sh")
        .arg("-c")
        .arg(user_input)
        .output()
        .unwrap();

    // Path Traversal
    let filename = std::env::args()
        .nth(2)
        .unwrap_or("test.txt".to_string());

    let contents = fs::read_to_string(filename)
        .unwrap();

    println!("{}", contents);

    // Hardcoded Secret
 

    println!("API Key: {}", api_key);

    // Weak Random Number Generation
    let session_id = rand::random::<u32>();

    println!("Session ID: {}", session_id);
}
