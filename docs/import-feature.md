## Contact Import Feature

The Contact Import feature allows users to upload their existing contact data from CSV or Excel files to quickly populate their contact list.

### Supported File Formats

- CSV (.csv)
- Excel (.xlsx, .xls)

### Import Process

1. **Upload File**: Select or drag-and-drop your contacts file
2. **Map Fields**: Match columns from your file to contact fields in the app
3. **Review**: Validate the data and check for duplicates
4. **Import**: Add the contacts to your database
5. **Undo (if needed)**: Option to reverse the import if something went wrong

### Field Mapping

The system will automatically attempt to map common field names:

| Source Field (Common Names)         | Target Field    |
| ----------------------------------- | --------------- |
| name, fullname, contact name        | Name            |
| email, email address                | Email           |
| role, position, title, job title    | Role            |
| company, organization, company name | Company         |
| tags, categories, labels            | Tags            |
| status, contact status              | Status          |
| date, date of contact, contact date | Date of Contact |

### Handling Duplicates

- The system identifies duplicates based on email addresses
- You can choose to skip importing duplicate contacts
- Existing contacts will not be modified by the import process

### Undo Import Functionality

After completing an import, you can undo it if necessary:

- The "Undo Import" option is available on the success screen
- This will remove all contacts that were just imported
- This feature is session-based (if you refresh the page, you can no longer undo)
- Use this if you notice errors or imported the wrong file

### Best Practices

1. **Clean your data** before importing:

   - Remove unnecessary columns
   - Ensure consistent formatting
   - Fix any missing data in required fields

2. **Use the correct status values**:

   - "Reached Out"
   - "Responded"
   - "Chatted"

3. **Format tags properly**:

   - Use comma-separated values for tags
   - Example: "important,follow-up,meeting"

4. **Date format**:
   - Use a standard date format (YYYY-MM-DD recommended)
   - If dates can't be parsed, today's date will be used
