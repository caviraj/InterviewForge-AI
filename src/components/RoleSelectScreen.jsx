import React from 'react';

export function RoleSelectScreen({ selectRole, isLoading }) {
    const roles = ["Software Engineer", "HR Manager", "Data Analyst"];

    return (
        <div id="role-select-screen">
            <h1 className="title">Select Your Role</h1>
            {isLoading ? (
                <p id="loading-indicator">Generating Questions...</p>
            ) : (
                <div className="role-cards">
                    {roles.map(role => (
                        <button key={role} className="role-card" onClick={() => selectRole(role)} disabled={isLoading}>
                            {role}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
