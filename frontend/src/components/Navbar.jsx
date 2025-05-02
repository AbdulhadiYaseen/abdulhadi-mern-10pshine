import React from "react";
import logo from "../assets/logo.png";

function Navbar() {
    return (
        <nav className="bg-yellow-500 text-white flex items-center justify-between py-3 px-6 shadow-md">
            <div className="flex items-center gap-3">
                <img src={logo} alt="NoteVault Logo" className="w-10 h-10" />
                <h2 className="text-2xl font-bold">NoteVault</h2>
            </div>
            {}
            <div></div>
        </nav>
    );
}

export default Navbar;
