import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
const Header = ({sidebarToggle, noticeToggle}) => {
    return (
        <nav className="white"> 
            <div className='nav-wrapper'>
                <Link to="/"  className="brand-logo"><i className="material-icons">photo_library</i></Link>
                <div className="input-field col s12 search">
                    <i className="material-icons prefix">search</i>
                    <label>search</label>
                    <input name="search" className="validate" type="search" />
                </div>
                <div className="icons">
                    <ul className="right">
                        <li><a onClick={sidebarToggle}><i className="material-icons">people_outline</i></a></li>
                        {/* people */}
                        <li><a onClick={noticeToggle}><i className="material-icons">notifications_none</i></a></li>
                        {/* notifications */}
                        {/* notifications_active */}
                        <li><Link to="/id"><i className="material-icons">person_outline</i></Link></li>
                        {/* person */}
                        <li></li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;