
export function handleInvalidToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('number');
    localStorage.removeItem('is_admin');
    return true;
}
  
export function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('number');
    localStorage.removeItem('is_admin');
    return true;
}
  
// export function handleLogin(token, userId, number, is_admin) {
//     localStorage.setItem('token', token);
//     localStorage.setItem('userId', userId);
//     localStorage.setItem('number', number);
//     localStorage.setItem('is_admin', is_admin);
//     return true;
// }