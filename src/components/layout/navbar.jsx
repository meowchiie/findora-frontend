export default function Navbar() {
    return (
        <>
            <div className="topbar">
                <div className="topbar-left">
                    <img src={logo} alt="Findora" className="topbar-logo" />
                </div>
        
                <div className="topbar-center">
                    <input type="text" placeholder="Search" />
                </div>
        
                <div className="topbar-right">
                    <div className="user-icon">👤</div>
                    <span className="username">User</span>
                </div>
            </div>
        </>
    );
}