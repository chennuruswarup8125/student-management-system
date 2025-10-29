package com.sms.student.service;

import com.sms.student.model.Student;
import com.sms.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get student by ID
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    // Create new student
    public Student createStudent(Student student) {
        // Check if email already exists
        if (studentRepository.findByEmail(student.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists: " + student.getEmail());
        }

        // Check if roll number already exists
        if (studentRepository.findByRollNumber(student.getRollNumber()).isPresent()) {
            throw new RuntimeException("Roll number already exists: " + student.getRollNumber());
        }

        return studentRepository.save(student);
    }

    // Update existing student
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (!student.getEmail().equals(studentDetails.getEmail())) {
            if (studentRepository.findByEmail(studentDetails.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists: " + studentDetails.getEmail());
            }
        }

        // Check if roll number is being changed and if new roll number already exists
        if (!student.getRollNumber().equals(studentDetails.getRollNumber())) {
            if (studentRepository.findByRollNumber(studentDetails.getRollNumber()).isPresent()) {
                throw new RuntimeException("Roll number already exists: " + studentDetails.getRollNumber());
            }
        }

        // Update fields
        student.setFirstName(studentDetails.getFirstName());
        student.setLastName(studentDetails.getLastName());
        student.setEmail(studentDetails.getEmail());
        student.setRollNumber(studentDetails.getRollNumber());
        student.setDepartment(studentDetails.getDepartment());
        student.setYear(studentDetails.getYear());

        return studentRepository.save(student);
    }

    // Delete student
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        studentRepository.delete(student);
    }

    // Search students by name or roll number
    public List<Student> searchStudents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return studentRepository.findAll();
        }
        return studentRepository.searchStudents(query.trim());
    }

    // Get students by department
    public List<Student> getStudentsByDepartment(String department) {
        return studentRepository.findByDepartment(department);
    }

    // Get students by year
    public List<Student> getStudentsByYear(Integer year) {
        return studentRepository.findByYear(year);
    }
}