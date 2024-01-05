import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { Avatar, Drawer, TextField } from "@mui/material";
import { MenuDrawer } from "../MenuDrawer";
import { SearchBar } from "../SearchBar/SearchBar";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toUSVString } from "util";
import { makeStyles, rgbToHex } from '@mui/material/styles';

export const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userID, setUserId] = useState<number | null>(null);
  const [usuFoto, setUsuFoto] = useState<string | null>(null);
  

  useEffect(() => {
    const userToken = localStorage.getItem('token');
    setToken(userToken);
  
    if (userToken) {
      try {
        const tokenDecodificado = jwtDecode<{ usu_id: number, usu_nome: string, usu_foto: string, exp: number }>(userToken);
  
        if (token && !isTokenExpiringSoon(token)) {
          const tempoRestante = tokenDecodificado.exp * 1000 - Date.now();
          const tempoParaExibirToast = tempoRestante - 5 * 60 * 1000;
          //const tempoRestanteUTC = tokenDecodificado.exp * 1000 - Date.now();
          //console.log("Tempo Restante:", new Date(tempoRestante).toISOString());
          console.log("Token Expira em:", new Date(tokenDecodificado.exp * 1000).toISOString());
          console.log("Data Atual:", new Date(Date.now()).toISOString());
          console.log("Tempo Restante:", formatarTempoRestante(tempoRestante));
          const timer = setTimeout(() => {
            toast.info('Sua sessão está prestes a expirar. Por favor, salve seu trabalho.', {
              position: toast.POSITION.BOTTOM_LEFT,
              autoClose: 5000,
            });
          }, tempoParaExibirToast);
    
          return () => clearTimeout(timer);
        }
  
        if (tokenDecodificado.exp * 1000 < Date.now()) {
          console.log("Token Expirado");
          localStorage.removeItem('token');
          navigate('/');
          window.location.reload();
          return;
        }
          
        const userID = tokenDecodificado?.usu_id;  
        const userName = tokenDecodificado?.usu_nome;
        fetch(`http://localhost:8000/usuarios/${userID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`
          },
        })
          .then(response => response.json())
          .then(data => {
            const userData = data.response[0];
            setUserName(userData.usu_nome);
            setUserId(userData.usu_id);
            setUsuFoto(userData.usu_foto)
  
          })
          .catch(error => console.error('Erro ao obter informações do usuário:', error));
      }catch(error){
        console.error(error);
      }
       
    
      }
     
    }, [token]); 

  function formatarTempoRestante(tempoRestanteUTC: number): string {
    const dataTempoRestante = new Date(tempoRestanteUTC);
    const horas = dataTempoRestante.getUTCHours();
    const minutos = dataTempoRestante.getUTCMinutes();
    const segundos = dataTempoRestante.getUTCSeconds();
  
    return `${horas}:${minutos}:${segundos}`;
  }

  function isTokenExpiringSoon(userToken: string) {
    const tokenDecodificado = jwtDecode<{ usu_id: number, usu_nome: string, usu_foto: string , exp:number }>(userToken);
  
    if (!tokenDecodificado || !tokenDecodificado.exp) {
      // Se o token não estiver presente ou não tiver o campo 'exp', consideramos que não está expirando em breve
      return false;
    }
  
    // Defina o limite para considerar como "em breve" (por exemplo, 5 minutos)
    const limiteEmBreve = 5 * 60 * 1000; // 5 minutos em milissegundos
  
    // Obtenha o tempo restante antes da expiração
    const tempoRestante = tokenDecodificado.exp * 1000 - Date.now(); // convertendo para milissegundos
  
    // Verifique se o tempo restante é menor que o limite
    return tempoRestante < limiteEmBreve;
  }
  
    
   
  return (
    <Box marginBottom={'100px'}>
      <AppBar position="fixed" color='primary'  >
        <Toolbar>
          <Box paddingRight={2} display={'flex'} color={'inherit'}>
            <MenuDrawer />
          </Box>
          <Typography variant="h6" component={Button} onClick={() => navigate('/')} color={'white'}>
            IndieShowCase
          </Typography>
          <Box display={'flex'} justifyContent={'center'} sx={{ flexGrow: 1 }}>
            <SearchBar />
          </Box>
          {token ? (
            <Box gap={1} display={'flex'}>
              <Avatar
                src={`http://localhost:8000/${usuFoto}`}
              />
              <Button color='pedro' variant='text' onClick={() => navigate(`/perfil/${userID}`)}> {userName}  </Button>
              <Button color='pedro' variant='text' onClick={() => navigate('/criarPostagem')}>Publicar</Button>
              <Button variant='text' color='pedro' onClick={() => {
                localStorage.removeItem('token');
                navigate('/');
                window.location.reload();
              }}>Logout</Button>
            </Box>
          ) : (
            <Box gap={1} display={'flex'}>
              <Button color='pedro' variant='text' onClick={() => navigate('/cadastroUsuario')}>Cadastrar</Button>
              <Button variant='text' color='pedro' onClick={() => navigate('/login')}>Login</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
          
};
//linha 113  <Box paddingRight={2} display={'flex'} color={'inherit'}>
 
/* useEffect(() => {
    const userToken = localStorage.getItem('token');
    setToken(userToken);
    

   
    // Exemplo: obtendo informações do usuário ao fazer login
    if (userToken) {
      try{
        const tokenDecodificado = jwtDecode<{ usu_id: number, usu_nome: string, usu_foto: string , exp:number }>(userToken);
         
        if (token && !isTokenExpiringSoon(token)) {
          // Calcular o tempo restante em milissegundos
          let calcularTempoRestante = Date.now() + tokenDecodificado.exp / 1000;
          const tempoRestante = calcularTempoRestante;
          const dataAtual = new Date();
          const dataStringUTC = dataAtual.toISOString();
          const tempoRest = new Date(calcularTempoRestante).toISOString();
          console.log("data agora: ",dataStringUTC, "\nData para acabar o token: ",tempoRest);
  
          // Definir o tempo para exibir o toast (por exemplo, 5 minutos antes da expiração)
          const tempoParaExibirToast = tempoRestante - 5 * 60 * 1000;
      
          // Agendar a exibição do toast
          const timer = setTimeout(() => {
            toast.info('Sua sessão está prestes a expirar. Por favor, salve seu trabalho.', {
              position: toast.POSITION.BOTTOM_LEFT,
              autoClose: 5000, // Tempo em milissegundos que o toast será exibido
            });
          }, tempoParaExibirToast);
      
          // Limpar o timer ao desmontar o componente
          return () => clearTimeout(timer);
        }
        // Verificar se o token expirou
        //const agora = Math.floor(Date.now() / 1000); // Obtém o timestamp atual em segundos
        //const expDaquiA1Minuto = agora + 60;
        // 10800 equivale a 3h
        //console.log("valor do token \'",tokenDecodificado.exp, "\' Date now ", Date.now() , "Token x10 ",tokenDecodificado.exp * 1000 );
         if (tokenDecodificado.exp * 1000  < Date.now()) {
          console.log(tokenDecodificado.exp);
          // Token expirado, limpar a sessão e redirecionar para a tela inicial
          localStorage.removeItem('token');
          navigate('/');
          window.location.reload();
          return;
        } 
         const userID = tokenDecodificado?.usu_id;  
      const userName = tokenDecodificado?.usu_nome;
      fetch(`http://localhost:8000/usuarios/${userID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
      })
        .then(response => response.json())
        .then(data => {
          const userData = data.response[0];
          setUserName(userData.usu_nome);
          setUserId(userData.usu_id);
          setUsuFoto(userData.usu_foto)

        })
        .catch(error => console.error('Erro ao obter informações do usuário:', error));
    }catch(error){
      console.error(error);
    }
     
  
    }
  }, [token]);    */