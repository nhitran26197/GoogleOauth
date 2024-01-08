
import env from 'react-dotenv';
const clientID = env.GOOGLE_CLIENT_ID;

function Login(){


    return(
        
        <div>
            <div id="g_id_onload"
                data-client_id="439198849513-e8i1q1gr4vv070qt6kl2laa8vr2ae0qh.apps.googleusercontent.com"
                data-context="signin"
                data-ux_mode="popup"
                data-login_uri="http://localhost:3000/"
                data-itp_support="true">
            </div>

            <div class="g_id_signin"
                data-type="standard"
                data-shape="pill"
                data-theme="outline"
                data-text="signup_with"
                ata-size="medium"
                data-logo_alignment="left">
            </div>
        </div>
    )
}

export default Login;
