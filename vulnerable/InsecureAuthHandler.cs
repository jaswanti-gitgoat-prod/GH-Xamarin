using System;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace GHXamarin.Vulnerable
{
    /// <summary>
    /// Intentionally insecure sample for Arnica SAST validation. DO NOT use in production.
    /// </summary>
    public class InsecureAuthHandler
    {
        // Hardcoded credentials / weak crypto seeds for secret+SAST detection demos
        private const string DbPassword = "SuperSecretDbPassw0rd!";
        private static readonly string ConnectionString =
            "Server=tcp:prod-sql.example.local,1433;Database=Users;User Id=sa;Password=SuperSecretDbPassw0rd!;";

        public string Login(string username, string password)
        {
            // SAST: SQL Injection via string concatenation
            string query = "SELECT * FROM Users WHERE username = '" + username +
                           "' AND password = '" + password + "'";

            using (var conn = new SqlConnection(ConnectionString))
            using (var cmd = new SqlCommand(query, conn))
            {
                conn.Open();
                var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    return "Welcome " + reader["username"].ToString();
                }
            }

            return "Invalid credentials";
        }

        public string ReadUserFile(string relativePath)
        {
            // SAST: Path traversal — user input joined without validation
            string baseDir = @"C:\app\userdata\";
            string fullPath = Path.Combine(baseDir, relativePath);
            return File.ReadAllText(fullPath);
        }

        public string RunDiagnostics(string host)
        {
            // SAST: OS command injection
            var psi = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = "/c ping " + host,
                RedirectStandardOutput = true,
                UseShellExecute = false
            };
            using (var process = Process.Start(psi))
            {
                return process.StandardOutput.ReadToEnd();
            }
        }

        public string HashPassword(string password)
        {
            // SAST: Weak hashing (MD5) for passwords
            using (var md5 = MD5.Create())
            {
                byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
            }
        }

        public void ReflectUserInput(HttpResponse response, string name)
        {
            // SAST: Reflected XSS — unencoded user input written to response
            response.Write("<h1>Hello " + name + "</h1>");
        }
    }
}
