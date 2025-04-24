import { Link, useNavigate } from "react-router-dom";

const HeaderDashboardComponent = ({ children }) => {
  const navigate = useNavigate();

  // ✅ Hàm xử lý Logout
  const handleLogout = () => {
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
    if (isConfirmed) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      navigate("/login"); // ✅ Chuyển hướng về trang đăng nhập
      alert("Đăng xuất thành công!");
    }
  };

  // ✅ Lấy thông tin người dùng từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="content1">
      <nav className="navbar navbar-expand bg-light navbar-light sticky-top px-4 py-0">
        {/* Thêm nút quay về trang Home */}
        <button className="btn btn-link" onClick={() => navigate("/")}>
          <i className="fa fa-home"></i> Home
        </button>

        <Link to="/dashboard" className="navbar-brand d-flex d-lg-none me-4">
          <h2 className="text-primary mb-0">
            <i className="fa fa-hashtag" />
          </h2>
        </Link>

        <button
          className="sidebar-toggler flex-shrink-0"
          onClick={() => navigate("/manager")}
        >
          <i className="fa fa-bars" />
        </button>

        <form className="d-none d-md-flex ms-4">
          <input
            className="form-control border-0"
            type="search"
            placeholder="Search"
          />
        </form>

        <div className="navbar-nav align-items-center ms-auto">
          {user && user.role === "manager" && (
            <button
              className="btn btn-link"
              onClick={() => navigate("/manager/manage-products")}
            >
              <i className="fa fa-th"></i> Manage Products
            </button>
          )}

          <div className="nav-item dropdown">
            <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
              <img
                className="rounded-circle me-lg-2"
                src="img/user.jpg"
                alt=""
                style={{ width: 40, height: 40 }}
              />
              <span className="d-none d-lg-inline-flex">{user?.name || "User"}</span>
            </a>
            <div className="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0">
              <Link to="/profile" className="dropdown-item">
                My Profile
              </Link>
              <Link to="/settings" className="dropdown-item">
                Settings
              </Link>
              {/* ✅ Nút Logout */}
              <button
                onClick={handleLogout}
                className="dropdown-item text-left w-100 bg-transparent border-0"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav> 

      {/* Nội dung trang */}
      <div className="container-fluid pt-4 px-4">{children}</div>
    </div>
  );
};

export default HeaderDashboardComponent;
