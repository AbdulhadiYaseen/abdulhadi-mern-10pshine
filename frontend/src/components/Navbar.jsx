import React from "react";
import logo from "../assets/logo.png";

function Navbar() {
    return (
        <nav className="bg-yellow-500 text-white flex items-center justify-between py-2 h-15">
            <div className="flex items-center gap-2 ml-4">
                <img src={logo} alt="Notesify Logo" className="w-10 h-10" />
                <h2 className="text-3xl">Notesify</h2>
            </div>
            <ul className="flex gap-8 items-center">
                <li>Home</li>
                <li>About</li>
                <li>Contact Us</li>
            </ul>
        </nav>
    );
}

export default Navbar;
