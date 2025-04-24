const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true, 
    enum: ["admin", "manager", "customer", "shipper", "sale"], 
  },
  description: { 
    type: String, 
    required: true,
  },
});

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
