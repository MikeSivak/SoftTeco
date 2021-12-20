import { useEffect, useState, useRef } from "react";
import { Box, FormControl, InputLabel, OutlinedInput, Menu, MenuItem, InputAdornment, Fab, Typography, Grid, Portal, useTabsList } from "@mui/material";
import AddIcon from '@mui/icons-material/Add'
import axios from 'axios';
import { set } from "date-fns";
import useDebouncedFunction from "./useDebouncedFunction";


const currencyFormStyles = {
    formBox: {
        margin: '0 auto',
        marginTop: '70px',
        padding: '2em',
        backgroundColor: 'white',
        maxWidth: 400,
        minWidth: 320,
        boxShadow: "1px 1px 19px 1px darkgray"
    }
}

const ITEM_HEIGHT = 48;

export default function CurrencyForm() {

    // Menu for add a new currency input
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        getAllCurrencies();
    };


    const [newInputValue, setNewInputValue] = useState({});

    const handleClose = (event) => {
        console.log('MENU ITEM VALUE: ' + event.currentTarget.selected)
        if (event.currentTarget.selected !== undefined) {
            getNewInputValue(newInputValue['name'], newInputValue['value'], event.currentTarget.selected)
            // setCurrencies({ ...currencies, [event.currentTarget.selected]: newInputValue['value'] })
        }
        setAnchorEl(null);
    };
    // =================================

    const getNewInputValue = async (base, amount, symbol) => {

        console.log("base: " + base + " | amount: " + amount + " | symbol: " + symbol)
        await axios.get(`${process.env.REACT_APP_API_URL}?base=${base}&amount=${amount}&symbols=${symbol}`)
            .then((res) => {
                console.log('--- getCurrencyValue ---')
                console.log(Object.keys(res.data.rates) + " | value: " + Object.values(res.data.rates))
                setCurrencies({ ...currencies, [Object.keys(res.data.rates)]: Object.values(res.data.rates) });
            })
            .catch((err) => {
                console.log("!ERROR:  " + err.message);
            })
    }

    // Array of currency inputs (start with 6 items)
    const [currencies, setCurrencies] = useState(
        {
            USD: undefined,
            EUR: undefined,
            BYN: undefined,
            RUB: undefined,
            UAH: undefined,
            PLN: undefined,
        }
    );

    const [allCurrensies, setAllCurrencies] = useState([]);

    // useDebouncedFunction(handleAmountChange, 500)
    const handleAmountChange = (prop) => (event) => {
        console.log('CURRENCY NAME: ' + [prop] + ' | VALUE: ' + event.target.value)
        setCurrencies({ ...currencies, [prop]: event.target.value })
        setNewInputValue({ name: [prop], value: event.target.value });
        if (event.target.value !== '') {
            debounced([prop], event.target.value);
        }
    }


    //get a currency rates by value - "amount" and currency names - "symbols"
    const getCurrencyValue = async (base, amount) => {
        await axios.get(`${process.env.REACT_APP_API_URL}?base=${base}&amount=${amount}&symbols=${Object.keys(currencies)}`)
            .then((res) => {
                console.log('--- getCurrencyValue ---')
                console.log(res.data.rates)
                setCurrencies(res.data.rates);
            })
            .catch((err) => {
                console.log("!ERROR:  " + err.message);
            })
    }

    const debounced = useDebouncedFunction(getCurrencyValue, 500)

    const getAllCurrencies = async () => {
        const duplicateNames = Object.keys(currencies);
        const duplicateNamesSet = new Set(duplicateNames);

        await axios.get(process.env.REACT_APP_API_URL)
            .then((res) => {
                const uniqueNames = Object.keys(res.data.rates).filter((name) => {
                    return !duplicateNamesSet.has(name);
                })
                setAllCurrencies(uniqueNames)

            })
            .catch((err) => {
                console.log("!ERROR:  " + err.message);
            })
    }

    useEffect(() => {
        getCurrencyValue("USD", 1);
        setNewInputValue({ name: "USD", value: 1 });
    }, [])

    return (
        <>
            <Box style={currencyFormStyles.formBox}>
                {
                    Object.entries(currencies).map(([key, value]) => (
                        <FormControl fullWidth style={{ marginTop: '1em' }}>
                            <OutlinedInput
                                style={{ backgroundColor: 'white' }}
                                id="outlined-adornment-amount"
                                value={value}
                                onChange={
                                    handleAmountChange(key)
                                }
                                startAdornment={<InputAdornment variant="standard" position="start">{key}</InputAdornment>}
                            />
                        </FormControl>
                    ))
                }

                <Box style={{ padding: '3em 0 0 0' }}>
                    <Fab color="primary" size="medium" aria-label="add" onClick={handleClick}>
                        <AddIcon />
                    </Fab>
                    {/* MENU */}
                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        PaperProps={{
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: '20ch',
                            },
                        }}
                    >
                        {allCurrensies.map((currency) => (
                            <MenuItem key={currency} selected={currency} onClick={handleClose}>
                                {currency}
                            </MenuItem>
                        ))}
                    </Menu>
                    {/* MENU */}
                    <Typography mt={2}>Добавить новую валюту</Typography>
                </Box>

            </Box>
        </>
    )
}