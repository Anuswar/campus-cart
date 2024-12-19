/*=============== SHOW HIDE PASSWORD LOGIN ===============*/
const passwordAccess = (loginPass, loginEye) => {
   const input = document.getElementById(loginPass),
         iconEye = document.getElementById(loginEye);

   iconEye.addEventListener('click', () => {
       // Toggle password visibility
       input.type = input.type === 'password' ? 'text' : 'password';

       // Toggle eye icon
       iconEye.classList.toggle('fa-eye');
       iconEye.classList.toggle('fa-eye-slash');
   });
};
passwordAccess('password', 'loginPassword');
