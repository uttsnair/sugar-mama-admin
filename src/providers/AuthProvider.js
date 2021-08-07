import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	function _setUser(user) {
		setUser(user);
	}

	useEffect(() => {
		const listener = auth.onAuthStateChanged((user) => {
			setUser(user);
		});
		return () => {
			listener();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, _setUser }}>
			{children}
		</AuthContext.Provider>
	);
};
