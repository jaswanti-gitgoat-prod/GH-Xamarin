use std::net::TcpListener;
use std::io::{Read, Write};
use std::fs;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();

    for stream in listener.incoming() {
        let mut stream = stream.unwrap();

        let mut buffer = [0; 1024];
        stream.read(&mut buffer).unwrap();

        let request = String::from_utf8_lossy(&buffer);

        // Path Traversal Vulnerability
        if let Some(path) = request.split("GET /").nth(1) {
            let file_name = path.split(' ').next().unwrap_or("");

            let content = fs::read_to_string(file_name)
                .unwrap_or_else(|_| "File not found".to_string());

            // Reflected XSS Vulnerability
            let response = format!(
                "<html><body>User requested: {}<br>{}</body></html>",
                file_name,
                content
            );

            let http_response = format!(
                "HTTP/1.1 200 OK\r\nContent-Length: {}\r\n\r\n{}",
                response.len(),
                response
            );

            stream.write_all(http_response.as_bytes()).unwrap();
        }
    }
}
