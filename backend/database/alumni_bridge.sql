-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 01, 2026 at 07:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alumni_bridge`
--

-- --------------------------------------------------------

--
-- Table structure for table `alumni`
--

CREATE TABLE `alumni` (
  `alumni_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alumni`
--

INSERT INTO `alumni` (`alumni_id`, `name`, `email`, `password`, `job_title`, `company`, `skills`, `bio`, `created_at`) VALUES
(1, 'Md Sakib Hasan', 'sakib@gmail.com', '$2y$10$XVOHiwRkpsG03HLsJqFRYeVpSoIli3BpPC/PIXKnljjDjNj3jvPYC', 'Manager', 'YAMAHA Motors', 'Project Management', 'Hi! This is Sakib Hasan.', '2026-09-28 01:38:31'),
(2, 'Ruhul Amin', 'ruhul@gmail.com', '$2y$10$dI811MrEgtPWY/LiOeHODufLZmxXIqqiB2lYncx7oSjR5eLIU3teq', 'Backend Developer', 'Business Automation', 'Laravel', 'I am a backend expert!', '2026-10-01 10:10:25');

-- --------------------------------------------------------

--
-- Table structure for table `availability`
--

CREATE TABLE `availability` (
  `availability_id` int(11) NOT NULL,
  `alumni_id` int(11) NOT NULL,
  `available_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('available','booked','cancelled') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `availability`
--

INSERT INTO `availability` (`availability_id`, `alumni_id`, `available_date`, `start_time`, `end_time`, `status`) VALUES
(1, 1, '2026-10-10', '09:00:00', '09:45:00', 'available'),
(2, 1, '2026-10-12', '09:00:00', '10:00:00', 'available'),
(3, 2, '2026-10-20', '10:00:00', '10:30:00', 'available'),
(4, 2, '2026-10-22', '10:00:00', '10:45:00', 'available');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `alumni_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `student_id`, `alumni_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, NULL, 1, 'New Mentorship Request', 'Md Sajid Hasan requested a mentorship session with you.', 1, '2026-09-28 02:09:49'),
(2, NULL, 1, 'New Referral Request', 'Md Sajid Hasan requested a job referral for Software Engineer at Yamaha.', 1, '2026-09-28 02:14:18');

-- --------------------------------------------------------

--
-- Table structure for table `referral_requests`
--

CREATE TABLE `referral_requests` (
  `referral_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `alumni_id` int(11) NOT NULL,
  `company` varchar(150) NOT NULL,
  `position` varchar(150) NOT NULL,
  `cv_link` varchar(500) NOT NULL,
  `portfolio_link` varchar(500) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','declined','referred') DEFAULT 'pending',
  `proof_note` text DEFAULT NULL,
  `proof_link` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `referral_requests`
--

INSERT INTO `referral_requests` (`referral_id`, `student_id`, `alumni_id`, `company`, `position`, `cv_link`, `portfolio_link`, `message`, `status`, `proof_note`, `proof_link`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Yamaha', 'Software Engineer', 'https://drive.google.com/file/d/1nLbUAkin77JmaTwMK3aF0_ZTgl256a9Q/view?usp=drive_link', 'https://github.com/mohammadsajidhasan', 'I am a professional web developer.', 'pending', NULL, NULL, '2026-09-28 02:14:18', '2026-09-28 02:14:18');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `alumni_id` int(11) NOT NULL,
  `availability_id` int(11) DEFAULT NULL,
  `topic` varchar(200) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('pending','confirmed','cancelled','declined') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `student_id`, `alumni_id`, `availability_id`, `topic`, `message`, `session_date`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(1, 1, 1, 1, NULL, 'Need some advice about project management', '2026-10-10', '09:00:00', '09:45:00', 'pending', '2026-09-28 02:09:49');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `cv_link` varchar(500) DEFAULT NULL,
  `portfolio_link` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `name`, `email`, `password`, `department`, `skills`, `cv_link`, `portfolio_link`, `created_at`) VALUES
(1, 'Md Sajid Hasan', 'sajid@gmail.com', '$2y$10$b0jorN5ZJlJtBpw0WKvDquX12rUUMt4phCm3JpCt6Zpad6F2uQd9K', 'CSE', 'Web Development', 'https://drive.google.com/file/d/1nLbUAkin77JmaTwMK3aF0_ZTgl256a9Q/view?usp=drive_link', 'https://github.com/mohammadsajidhasan', '2026-09-28 01:25:23'),
(2, 'Anas Ahmed', 'anas@gmail.com', '$2y$10$hu9QcQ2sLyBf8i9KYVqQtOxL.yR28rPpBfj7I6By9H24wHkeqm0b.', 'CSE', 'Backend Developer', 'https://www.linkedin.com/in/anasahmed-/', 'https://github.com/Anas-xy', '2026-10-01 09:54:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alumni`
--
ALTER TABLE `alumni`
  ADD PRIMARY KEY (`alumni_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `availability`
--
ALTER TABLE `availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD KEY `alumni_id` (`alumni_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `alumni_id` (`alumni_id`);

--
-- Indexes for table `referral_requests`
--
ALTER TABLE `referral_requests`
  ADD PRIMARY KEY (`referral_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `alumni_id` (`alumni_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `alumni_id` (`alumni_id`),
  ADD KEY `availability_id` (`availability_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alumni`
--
ALTER TABLE `alumni`
  MODIFY `alumni_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `availability`
--
ALTER TABLE `availability`
  MODIFY `availability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `referral_requests`
--
ALTER TABLE `referral_requests`
  MODIFY `referral_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `availability`
--
ALTER TABLE `availability`
  ADD CONSTRAINT `availability_ibfk_1` FOREIGN KEY (`alumni_id`) REFERENCES `alumni` (`alumni_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`alumni_id`) REFERENCES `alumni` (`alumni_id`) ON DELETE CASCADE;

--
-- Constraints for table `referral_requests`
--
ALTER TABLE `referral_requests`
  ADD CONSTRAINT `referral_requests_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `referral_requests_ibfk_2` FOREIGN KEY (`alumni_id`) REFERENCES `alumni` (`alumni_id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`alumni_id`) REFERENCES `alumni` (`alumni_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`availability_id`) REFERENCES `availability` (`availability_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
