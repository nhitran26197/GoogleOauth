import {GoogleLogout} from 'react-google-login';
import env from 'react-dotenv';
const clientID = env.GOOGLE_CLIENT_ID;

function Logout(){
    const onLogoutSuccess = (res)=>{    
        console.log("Logged out successfully");
    }
    return(
        <div>
            <GoogleLogout
                clientId={clientID}
                buttonText="Logout"
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}
export default Logout;