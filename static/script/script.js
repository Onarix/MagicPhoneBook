 function insertUser(user){
    document.getElementById("contacts").innerHTML+=`<tr>
            <td>
                `+user.imie+`
            </td>
            <td>
                `+user.nazwisko+`
            </td>
            <td>
                `+user.adres+`
            </td>
            <td>
                `+user.telefon+`
            </td>
            <td>
                `+user.mail+`
            </td>
            <td>
                <div class="text-center">
                    
                </div>
            </td>
        </tr>`;
}