import { MdOutlineSearch, MdOutlineCancel } from "react-icons/md";
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";



export const SearchBar = () => {
    const [value, setValue] = useState("");

    const navigate = useNavigate();


    const PesquisarFormSchema = z.object({
        query: z.string().nonempty("campo obrigatorio"),
    });
    type ComentarFormData = z.infer<typeof PesquisarFormSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ComentarFormData>({
        resolver: zodResolver(PesquisarFormSchema),
    });

    const PesquisarPostagem = (data: ComentarFormData) => {
        navigate(`/query/${data.query}`);
    };


    return (
        <Box component="form" onSubmit={handleSubmit(PesquisarPostagem)}>
            <Box display={"flex"}  flexDirection={"row"} gap={2}>
                <TextField
                    placeholder="Pesquisar"
                    type="text"
                    variant="outlined"  
                    sx={{ width: '400px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'white',
                            },
                            '&:hover fieldset': {
                                borderColor: 'white',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'white',
                            },
                        },
                        '& .MuiInputBase-input': {
                              color: 'white',
                            },
                        '& .MuiInputBase-input::placeholder': {
                              color: 'white',
                            opacity: 1, // Para garantir que a cor seja aplicada
                        },
                     }}
                    {...register("query")}
                   // style={{}}
                    color='warning'
                    size="small"
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdOutlineSearch />
                            </InputAdornment>
                        ),

                        endAdornment: value && (
                            <IconButton
                            style={{color:'red'}}
                                aria-label="toggle password visibility"
                                onClick={() => {
                                    setValue("")
                                    navigate('/')
                                }}
                            ><MdOutlineCancel /></IconButton>
                        )
                    }}
                />
                <Button color="secondary" variant="contained" size="small" type="submit">
                    Pesquisar
                </Button>
            </Box>
        </Box>
    );
}