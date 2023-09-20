package com.SNStest.sns;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.support.SessionStatus;

// import com.github.realzimboguy.ewelink.api.model.login.LoginRequest;

@RestController
public class AuthController {
    public boolean isValidCredentials(String username, String password){
        String dbUrl = "jdbc:mysql://localhost:3306/chatroom";
        String dbUsername = "root";
        String dbPassword = "password";
        int check = 0;

        String inputUsername = username; // Replace with actual input
        String inputPassword = password; // Replace with actual input

        try {
            Connection connection = DriverManager.getConnection(dbUrl, dbUsername, dbPassword);

            String query = "SELECT * FROM users WHERE username = ? AND password = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(query);
            preparedStatement.setString(1, inputUsername);
            preparedStatement.setString(2, inputPassword);

            ResultSet resultSet = preparedStatement.executeQuery();

            if (resultSet.next()) {
                check = 1;
            }

            resultSet.close();
            preparedStatement.close();
            connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        if(check == 1){
            return true;
        }
        return false;
    }

    @PostMapping("/register") // Use POST method for registration
    public ResponseEntity<String> register(@RequestBody RegistrationRequest request) {
        String fullname = request.getFullname();
        String email = request.getEmail();
        String newUsername = request.getNewUsername();
        String newPassword = request.getNewPassword();
        Boolean check = false;


        // Here, you would process and store the registration data in your database
        String dbUrl = "jdbc:mysql://localhost:3306/chatroom";
        String dbUsername = "root";
        String dbPassword = "password";
        
        // Replace this with your actual registration logic

        try (Connection connection = DriverManager.getConnection(dbUrl, dbUsername, dbPassword)) {
            String query = "INSERT INTO users (full_name, email, username, password) VALUES (?, ?, ?, ?)";
            PreparedStatement preparedStatement = connection.prepareStatement(query);
            preparedStatement.setString(1, fullname);
            preparedStatement.setString(2, email);
            preparedStatement.setString(3, newUsername);
            preparedStatement.setString(4, newPassword);

            int rowsAffected = preparedStatement.executeUpdate();
            if (rowsAffected > 0){
                check=true;
               // connection.commit();
            }
        } catch (SQLException e) {
            check=false;
            e.printStackTrace();
        }

        // For example, you could insert the data into your users table
        // and perform any necessary validation
        
        // For simplicity, we'll assume successful registration
        if (check==true){
            return ResponseEntity.ok("Registration successful");
        }
        else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("please register again");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();

        // Here, you would validate the credentials against your database
        
        // Replace this with your actual authentication logic
        if (isValidCredentials(username, password)) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<String> logout(SessionStatus sessionStatus) 
    {
        // Perform any necessary cleanup or actions for logout
        
        // Clear session-related data
        sessionStatus.setComplete();
        
        // Return a success response
        return ResponseEntity.ok("Logout successful");
    }
}

class LoginRequest {
    private String username;
    private String password;

    // Getters and setters

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

class RegistrationRequest {
    private String fullname;
    private String email;
    private String newUsername;
    private String newPassword;

    // Getters and setters

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNewUsername() {
        return newUsername;
    }

    public void setNewUsername(String newUsername) {
        this.newUsername = newUsername;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}