
-- Add the yathirai_count column to the members table
ALTER TABLE members 
ADD COLUMN yathirai_count text;

-- Optional: If you want to set a default value for existing rows (though your UI handles nulls)
-- UPDATE members SET yathirai_count = '1' WHERE yathirai_count IS NULL;

-- Add the discount column to the members table
ALTER TABLE members 
ADD COLUMN discount numeric DEFAULT 0;
