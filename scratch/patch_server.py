
import os

path = r'c:\website\queuing-system\server\index.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix destructuring
old_destruct = """    const {
      fullName,
      phoneNumber,
      email,
      serviceType,
      preferredDate,
      preferredTime,
      notes
    } = req.body;"""

new_destruct = """    const {
      fullName,
      phoneNumber,
      email,
      serviceType,
      preferredDate,
      preferredTime,
      notes,
      specialistId,
      agentCode
    } = req.body;"""

content = content.replace(old_destruct.replace('\n', '\r\n'), new_destruct.replace('\n', '\r\n'))
content = content.replace(old_destruct, new_destruct)

# Fix INSERT
old_insert = "INSERT INTO appointments (full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, cancel_token)"
new_insert = "INSERT INTO appointments (full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, cancel_token, specialist_id, agent_code)"
content = content.replace(old_insert, new_insert)

old_values = "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
new_values = "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
content = content.replace(old_values, new_values)

old_arr = "const values = [fullName, phoneNumber, email, serviceType, preferredDate, preferredTime, notes || '', cancelToken];"
new_arr = "const values = [fullName, phoneNumber, email, serviceType, preferredDate, preferredTime, notes || '', cancelToken, specialistId, agentCode];"
content = content.replace(old_arr, new_arr)

# Fix Migration
old_mig = """  // Migrate appointments table if needed
  try {
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS specialist_id INTEGER REFERENCES booking_specialists(id)');
  } catch (e) {
    console.log('Appointments table already has specialist_id or not found.');
  }"""

new_mig = """  // Migrate appointments table
  try {
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS specialist_id INTEGER REFERENCES booking_specialists(id)');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agent_code VARCHAR(50)');
  } catch (e) {}"""

content = content.replace(old_mig.replace('\n', '\r\n'), new_mig.replace('\n', '\r\n'))
content = content.replace(old_mig, new_mig)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Finished patching server/index.js")
