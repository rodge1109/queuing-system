
import os

path = r'c:\website\queuing-system\server\index.js'
with f = open(path, 'r', encoding='utf-8'):
    content = f.read()

# Fix destructuring
old_destruct = """      specialistId,
      agentCode
    } = req.body;"""

new_destruct = """      specialistId,
      agentCode,
      pickupLocation,
      destinationLocation
    } = req.body;"""

content = content.replace(old_destruct, new_destruct)

# Fix INSERT columns
old_insert = "INSERT INTO appointments (full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, cancel_token, specialist_id, agent_code)"
new_insert = "INSERT INTO appointments (full_name, phone_number, email, service_type, preferred_date, preferred_time, notes, cancel_token, specialist_id, agent_code, pickup_location, destination_location)"
content = content.replace(old_insert, new_insert)

# Fix VALUES
old_values = "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)"
new_values = "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
content = content.replace(old_values, new_values)

# Fix Values Array
old_arr = "const values = [fullName, phoneNumber, email, serviceType, preferredDate, preferredTime, notes || '', cancelToken, specialistId, agentCode];"
new_arr = "const values = [fullName, phoneNumber, email, serviceType, preferredDate, preferredTime, notes || '', cancelToken, specialistId, agentCode, pickupLocation, destinationLocation];"
content = content.replace(old_arr, new_arr)

# Fix Migration
old_mig = "await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agent_code VARCHAR(50)');"
new_mig = """await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS agent_code VARCHAR(50)');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pickup_location TEXT');
    await pool.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS destination_location TEXT');"""

content = content.replace(old_mig, new_mig)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print("Finished patching server/index.js for transport fields")
