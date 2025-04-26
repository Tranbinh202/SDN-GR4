const User = require('../models/User');

// Cập nhật thông tin profile user
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, address } = req.body;

    // Nếu address là string thì cập nhật trực tiếp, nếu là object thì cập nhật từng trường
    let updateData = { name, phone };
    if (typeof address === 'string') {
      updateData.address = address;
    } else if (typeof address === 'object') {
      updateData.address = { ...address };
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật profile' });
  }
}; 