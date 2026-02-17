-- Align profile field sizes with backend validation rules
ALTER TABLE `profiles`
    MODIFY `competences` VARCHAR(500) NULL,
    MODIFY `formation` VARCHAR(500) NULL,
    MODIFY `experiences` VARCHAR(500) NULL,
    MODIFY `phone` VARCHAR(30) NULL;
