package com.sms.student.repository;

import com.sms.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Find student by email
    Optional<Student> findByEmail(String email);

    // Find student by roll number
    Optional<Student> findByRollNumber(String rollNumber);

    // Search students by first name or last name (case-insensitive)
    @Query("SELECT s FROM Student s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Student> searchStudents(@Param("query") String query);

    // Find students by department
    List<Student> findByDepartment(String department);

    // Find students by year
    List<Student> findByYear(Integer year);
}