import { Link } from "react-router-dom";

const NavbarDashboard = () => {
  return (
    <div className="sidebar1 pe-4 pb-3">
      <nav className="navbar bg-light navbar-light">
  
        <div className="d-flex align-items-center ms-4 mb-4">
          <div className="position-relative">
            <img
              className="rounded-circle"
              src="img/user.jpg"
              alt="User Avatar"
              style={{ width: 40, height: 40 }}
            />
            <div className="bg-success rounded-circle border border-2 border-white position-absolute end-0 bottom-0 p-1" />
          </div>
          <div className="ms-3">
            <h6 className="mb-0">John Doe</h6>
            <span>Admin</span>
          </div>
        </div>
        <div className="navbar-nav w-100">
          <Link to="/manager/dashboard" className="nav-item nav-link active">
            <i className="fa fa-tachometer-alt me-2" />
            Dashboard
          </Link>
          
      
      

         
        </div>
      </nav>
    </div>
  );
};

export default NavbarDashboard;
