import React, { useEffect, useState, useRef, useContext } from 'react'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { NavLink, useNavigate } from 'react-router-dom';
import Dark from '../Dark';
import { Context } from '../context/ContextProvider';

const Dashboard = () => {
    let [dropDown, setDropDown] = useState(false)
    let { isDarkMode, toggleDarkMode } = useContext(Context)
    let navigate = useNavigate()
    const [data, setData] = useState([])
    let [page, setPage] = useState(1)
    let [id, setId] = useState(1)
    useEffect(() => {
        console.log()
        const fetchData = async () => {
            try {
                const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/payouts/${page == 1 ? "" : `?page=${+page}`}`, {
                    method: "GET",
                    headers: {
                        "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`
                    }
                });
                if (response.status === 401) {
                    navigate("/login")
                    console.log("Unauthorized access, redirecting to login.");
                } else if (response.ok) {
                    const data = await response.json();
                    setData(data);
                } else {
                    console.log("Unexpected error:", response.status);
                }
            } catch (error) {
                console.error("An error occurred:", error);
                navigate("/login")
            }
        };

        fetchData();
    }, [navigate, page]);
    
    let [reason, setReason] = useState("")

    const handleCancel = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(`https://dev.royal-pay.org/api/v1/internal/payouts/deny/${id}/`, {
                method: "POST",
                headers: {
                    "AUTHORIZATION": `Bearer ${localStorage.getItem("access")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reason: reason
                })
            })
            if (response.status === 401) {
                navigate("/login")
                console.log("Unauthorized access, redirecting to login.");
            } else if (response.status == 400) {

            } else if (response.ok) {
                const data = await response.json();
                window.location.reload();
            } else {
                console.log("Unexpected error:", response.status);
            }
        } catch (error) {
            console.log(error)
        }
    }
    let [zoom, setZoom] = useState(false)

    let methods = []
    data?.results?.map(item => methods.push(item.method.name))
    const startDateRef = useRef(null);
    let [open, setOpen] = useState(true)
    let [details, setDetails] = useState([])
    // 1ci action
    const [modal, setModal] = useState(false)
    // 2ci action
    const [modalChek, setModalChek] = useState(false)

    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [startDate, setStartDate] = useState("2024-10-16");
    let [merchant, setMerchant] = useState("")
    let [trader, setTrader] = useState("")
    let [selectStatus, setSelectStatus] = useState("")
    let [selectMethod, setSelectMethod] = useState("")
    const [startTime, setStartTime] = useState("");
    const [time, setTime] = useState('');

    // payout
    let [cancel, setCancel] = useState(false)
    let [cancelCheck, setCancelCheck] = useState(false)



    const handleStartTimeChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        let cleanedValue = value;

        if (cleanedValue.length >= 3) {
            cleanedValue = cleanedValue.slice(0, 2) + ':' + cleanedValue.slice(2);
        }

        const timeParts = cleanedValue.split(':');
        if (timeParts[0] && parseInt(timeParts[0], 10) > 23) {
            cleanedValue = '23:' + (timeParts[1] ? timeParts[1] : '00');
        }

        if (timeParts[1] && parseInt(timeParts[1], 10) > 59) {
            cleanedValue = timeParts[0] + ':59';
        }

        if (cleanedValue.endsWith(':000')) {
            cleanedValue = cleanedValue.slice(0, -1);
        }

        setTime(cleanedValue);
        setStartTime(cleanedValue);

    };
    useEffect(() => {
        const filteredData = data?.results?.filter(customer => {
            const customerDate = new Date(customer?.created_at)
            let [startHour, startMinute] = startTime.split(":");

            let startDateTime;

            if (startTime && !startMinute) {
                startDateTime = new Date(`${startDate}T${((+startHour + 1) + ':' + "00") || '00:00'}`)
            } else if (startTime) {
                startDateTime = new Date(`${startDate}T${((+startHour + 1) + ':' + startMinute) || '00:00'}`)
            } else {
                startDateTime = new Date(`${startDate}T00:00`);
            }
            let merchantMatch = true;
            if (merchant) {
                merchantMatch = customer.merchant["username"].toLowerCase().includes(merchant.toLowerCase());
            }
            let traderMatch = true;
            if (trader) {
                traderMatch = customer.trader ? customer.trader["username"].toLowerCase().includes(trader.toLowerCase()) : "";
            }
            let statusMatch = true;
            if (selectStatus) {
                statusMatch = customer.status.toLowerCase() === selectStatus.toLowerCase();
            }
            let methodMatch = true;
            if (selectMethod) {
                methodMatch = customer.method.name.toLowerCase() === selectMethod.toLowerCase();
            }

            return (customerDate >= startDateTime || !startDateTime) && traderMatch && methodMatch && merchantMatch && statusMatch;
        });
        setFilteredCustomers(filteredData);
    }, [startDate, merchant, trader, selectStatus, startTime]);
    const handleShow = (info) => {
        setDetails([info])
    }

    return (
        <div onClick={() => dropDown ? setDropDown(!dropDown) : ""} className={`${isDarkMode ? "bg-[#000] border-black" : "bg-[#E9EBF7] border-[#F4F4F5] border"} min-h-[100vh]  relative  border`}>
            <div className='flex'>
                <div className={`${isDarkMode ? "bg-[#1F1F1F] " : "bg-[#F5F6FC] border-[#F4F4F5] border"}  min-h-[100vh] z-20  relative `}>
                    <h3 className={`py-[20px] flex items-center justify-start ml-[8px] font-medium px-[8px] ${isDarkMode ? "text-white" : "text-black"}`}>Лого</h3>
                    <div className={` ${!open && "min-w-[263px]"} `}>
                        <div className="">
                            <NavLink to={"/dash"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.4286 15.4286H19.6543C19.0714 16.0886 18.4029 16.6629 17.6743 17.1429C16.0457 18.2314 14.1 18.8571 12 18.8571C9.9 18.8571 7.95429 18.2314 6.32571 17.1429C5.59714 16.6629 4.92857 16.0886 4.34571 15.4286H2.57143C1.15714 15.4286 0 16.5857 0 18V21.4286C0 22.8429 1.15714 24 2.57143 24H21.4286C22.8429 24 24 22.8429 24 21.4286V18C24 16.5857 22.8429 15.4286 21.4286 15.4286ZM18.8571 21.4286H5.14286C4.67143 21.4286 4.28571 21.0429 4.28571 20.5714C4.28571 20.1 4.67143 19.7143 5.14286 19.7143H18.8571C19.3286 19.7143 19.7143 20.1 19.7143 20.5714C19.7143 21.0429 19.3286 21.4286 18.8571 21.4286ZM12 0C7.27714 0 3.42857 3.84857 3.42857 8.57143C3.42857 11.3743 4.78286 13.8686 6.86571 15.4286C8.29714 16.5086 10.0714 17.1429 12 17.1429C13.9286 17.1429 15.7029 16.5086 17.1343 15.4286C18.2011 14.6318 19.0674 13.597 19.664 12.4066C20.2607 11.2162 20.5714 9.903 20.5714 8.57143C20.5714 3.84857 16.7229 0 12 0ZM11.5714 7.71429H12.3771C12.9455 7.71429 13.4905 7.94005 13.8924 8.34191C14.2942 8.74378 14.52 9.28882 14.52 9.85714C14.52 10.9029 13.8086 11.76 12.8571 11.9829V12.8571C12.8571 13.3286 12.4714 13.7143 12 13.7143C11.5286 13.7143 11.1429 13.3286 11.1429 12.8571V12.0343H10.2857C9.81429 12.0343 9.42857 11.6571 9.42857 11.1771C9.42857 10.7057 9.81429 10.32 10.2857 10.32H12.3771C12.6171 10.32 12.8057 10.1314 12.8057 9.89143C12.8057 9.61714 12.6171 9.42857 12.3771 9.42857H11.5714C11.04 9.42911 10.5274 9.23217 10.133 8.87598C9.73863 8.5198 9.49067 8.02979 9.43727 7.50107C9.38386 6.97235 9.52882 6.44265 9.84399 6.0148C10.1592 5.58694 10.6221 5.29146 11.1429 5.18571V4.28571C11.1429 3.81429 11.5286 3.42857 12 3.42857C12.4714 3.42857 12.8571 3.81429 12.8571 4.28571V5.14286H13.6629C14.1343 5.14286 14.52 5.52857 14.52 6C14.52 6.47143 14.1343 6.85714 13.6629 6.85714H11.5714C11.3314 6.85714 11.1429 7.04571 11.1429 7.28571C11.1429 7.52571 11.3314 7.71429 11.5714 7.71429Z" fill="#8D8F9B" />
                                </svg>
                                <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px] font-medium ml-[8px] `}>Управления депозитами</p>
                            </NavLink>
                            <NavLink to={"/deposit"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                                <svg width="24" height="24" viewBox="0 0 19 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.78571 18.2142H12.2143C12.9607 18.2142 13.5714 17.5633 13.5714 16.7678V9.53558H15.7293C16.9371 9.53558 17.5479 7.97343 16.6929 7.06217L10.4636 0.423003C10.338 0.288913 10.1889 0.182531 10.0247 0.109946C9.86053 0.0373615 9.68453 0 9.50679 0C9.32904 0 9.15304 0.0373615 8.98887 0.109946C8.82469 0.182531 8.67555 0.288913 8.55 0.423003L2.32071 7.06217C1.46571 7.97343 2.06286 9.53558 3.27071 9.53558H5.42857V16.7678C5.42857 17.5633 6.03929 18.2142 6.78571 18.2142ZM1.35714 21.1071H17.6429C18.3893 21.1071 19 21.758 19 22.5536C19 23.3491 18.3893 24 17.6429 24H1.35714C0.610714 24 0 23.3491 0 22.5536C0 21.758 0.610714 21.1071 1.35714 21.1071Z" fill="#8D8F9B" />
                                </svg>
                                <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Пополнение депозита</p>

                            </NavLink>
                            <NavLink to={"/payout"} className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] bg-[#2D54DD4D]">
                                <svg width="24" height="24" className='fill-[#2D54DD]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.3633 19.6364H18.5452C16.1391 19.6364 14.1816 17.6789 14.1816 15.2728C14.1816 12.8668 16.1391 10.9093 18.5452 10.9093H22.3633C22.4349 10.9093 22.5059 10.8953 22.5721 10.8679C22.6383 10.8405 22.6985 10.8003 22.7491 10.7496C22.7998 10.699 22.8399 10.6388 22.8673 10.5726C22.8947 10.5064 22.9088 10.4355 22.9088 10.3638V8.7275C22.9088 7.5837 22.0216 6.6535 20.9006 6.56329L17.7681 1.09179C17.4778 0.585754 17.009 0.224073 16.4481 0.0738875C15.8899 -0.0752748 15.3061 0.00306481 14.8064 0.293873L4.06783 6.5457H2.1818C0.978529 6.5457 0 7.52418 0 8.7275V21.8182C0 23.0215 0.978478 24 2.1818 24H20.727C21.9302 24 22.9088 23.0215 22.9088 21.8182V20.1819C22.9088 20.1102 22.8947 20.0393 22.8673 19.9731C22.8399 19.9069 22.7998 19.8467 22.7491 19.7961C22.6985 19.7454 22.6383 19.7052 22.5721 19.6778C22.5059 19.6504 22.4349 19.6363 22.3633 19.6364ZM18.4445 4.4698L19.633 6.5457H14.8789L18.4445 4.4698ZM6.23598 6.5457L15.3556 1.23666C15.6022 1.0923 15.8904 1.05395 16.1658 1.12748C16.4444 1.20204 16.6766 1.38209 16.821 1.63403L16.8221 1.63603L8.38935 6.5457H6.23598Z" />
                                    <path d="M22.3642 12H18.5461C16.7414 12 15.2734 13.468 15.2734 15.2727C15.2734 17.0773 16.7414 18.5453 18.5461 18.5453H22.3642C23.2666 18.5453 24.0006 17.8113 24.0006 16.909V13.6363C24.0006 12.734 23.2666 12 22.3642 12ZM18.5461 16.3635C17.9448 16.3635 17.4552 15.874 17.4552 15.2727C17.4552 14.6713 17.9448 14.1818 18.5461 14.1818C19.1475 14.1818 19.637 14.6713 19.637 15.2727C19.637 15.874 19.1475 16.3635 18.5461 16.3635Z" />
                                </svg>
                                <p className={`${open && "hidden"} text-[#2D54DD] text-[14px] font-medium ml-[8px]`}>Выплаты</p>
                            </NavLink>
                            <div className="py-[12px] cursor-pointer px-[8px] flex items-center rounded-[4px] mx-[12px] ">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_289_6049)">
                                        <path d="M19.2656 0.414062V4.68991H23.5411L19.2656 0.414062Z" fill="#8D8F9B" />
                                        <path d="M18.5625 6.09375C18.1742 6.09375 17.8594 5.77894 17.8594 5.39062V0H7.78125C6.61814 0 5.67188 0.946266 5.67188 2.10938V9.9698C5.90353 9.9488 6.13795 9.9375 6.375 9.9375C8.77163 9.9375 10.917 11.0332 12.3368 12.75H19.9688C20.3571 12.75 20.6719 13.0648 20.6719 13.4531C20.6719 13.8414 20.3571 14.1562 19.9688 14.1562H13.2632C13.7124 15.0328 13.9888 15.9877 14.0771 16.9688H19.9688C20.3571 16.9688 20.6719 17.2836 20.6719 17.6719C20.6719 18.0602 20.3571 18.375 19.9688 18.375H14.0771C13.8668 20.6971 12.6261 22.7262 10.8168 24H21.8438C23.0069 24 23.9531 23.0537 23.9531 21.8906V6.09375H18.5625ZM19.9688 9.9375H9.65625C9.26794 9.9375 8.95312 9.62269 8.95312 9.23438C8.95312 8.84606 9.26794 8.53125 9.65625 8.53125H19.9688C20.3571 8.53125 20.6719 8.84606 20.6719 9.23438C20.6719 9.62269 20.3571 9.9375 19.9688 9.9375Z" fill="#8D8F9B" />
                                        <path d="M6.375 11.3438C2.88567 11.3438 0.046875 14.1825 0.046875 17.6719C0.046875 21.1612 2.88567 24 6.375 24C9.86433 24 12.7031 21.1612 12.7031 17.6719C12.7031 14.1825 9.86433 11.3438 6.375 11.3438ZM8.25 18.375H6.375C5.98669 18.375 5.67188 18.0602 5.67188 17.6719V14.8594C5.67188 14.4711 5.98669 14.1562 6.375 14.1562C6.76331 14.1562 7.07812 14.4711 7.07812 14.8594V16.9688H8.25C8.63831 16.9688 8.95312 17.2836 8.95312 17.6719C8.95312 18.0602 8.63831 18.375 8.25 18.375Z" fill="#8D8F9B" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_289_6049">
                                            <rect width="24" height="24" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <p className={`${open && "hidden"} text-[#BFC0C9] text-[14px] font-medium ml-[8px]`}>Саппорт Транзакций</p>
                            </div>
                        </div>
                    </div>
                    <div onClick={() => { setOpen(true) }} className={`bg-[#1773F1] cursor-pointer absolute top-2 right-[-19px]  h-[45px] ${open ? "hidden" : "flex justify-center items-center"}  rounded-r-[4px] w-[19px]`}>
                        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.40625 2.31512L2.82625 7.35924L7.40625 12.4034L5.99625 13.9529L-0.00375366 7.35924L5.99625 0.765625L7.40625 2.31512Z" fill="white" />
                        </svg>
                    </div>
                    {/* open */}
                    <div onClick={() => { setOpen(false) }} className={`bg-[#1773F1] cursor-pointer absolute top-2 right-[-19px] ${!open ? "hidden" : "flex justify-center items-center"}  h-[45px]  rounded-r-[4px] w-[19px]`}>
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.93492e-06 10.59L4.58 6L3.93492e-06 1.41L1.41 0L7.41 6L1.41 12L3.93492e-06 10.59Z" fill="white" />
                        </svg>
                    </div>
                </div>
                <div className={`flex w-full justify-end ${isDarkMode ? "bg-[#1F1F1F] " : "bg-[#F5F6FC] border-[#F4F4F5]"} absolute right-0 pr-[16px] py-2 items-center `}>
                    <div className="flex ">
                        <div className="mr-[16px]">
                            <h4 className={`text-[14px] font-normal ${!isDarkMode ? "text-[#18181B]" : "text-[#E7E7E7]"} `}>Дмитрий Князев</h4>
                            <p className='text-[14px] font-normal text-[#60626C]'>Админ</p>
                        </div>
                        <div className="flex items-center cursor-pointer">
                            <div onClick={() => setDropDown(!dropDown)} className="bg-[#4CAF50]  rounded-[100px] text-white w-[48px] h-[48px] flex items-center justify-center">
                                ДК
                            </div>
                            <div onClick={() => setDropDown(!dropDown)} className="cursor-pointer ">
                                <svg width="16" height="10" viewBox="0 0 12 6" fill="none" className='ml-2 my-4' xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.57143 6C5.39315 6 5.21485 5.93469 5.07905 5.80469L0.204221 1.13817C-0.0680735 0.877514 -0.0680735 0.456152 0.204221 0.195494C0.476514 -0.0651646 0.916685 -0.0651646 1.18898 0.195494L5.57143 4.39068L9.95388 0.195494C10.2262 -0.0651646 10.6663 -0.0651646 10.9386 0.195494C11.2109 0.456152 11.2109 0.877514 10.9386 1.13817L6.06381 5.80469C5.92801 5.93469 5.74971 6 5.57143 6Z" fill="#60626C" />
                                </svg>
                            </div>
                        </div>
                        {/* darkmode */}
                        <div style={{ boxShadow: "0px 4px 12px 1px #0000001A" }} className={` absolute text-[14px] font-normal z-50 w-[250px] p-4 ${isDarkMode ? "bg-[#1F1F1F] text-[#E7E7E7]" : "bg-white"}  right-2 top-16 rounded-[12px] h-[84px] duration-300 ${dropDown ? "opacity-100" : "opacity-0"}`}>
                            <div className="flex mb-[12px] justify-between">
                                <h4>Тема</h4>
                                <Dark />
                            </div>
                            <NavLink to={"/login"} onClick={() => localStorage.removeItem("access")}>Выйти</NavLink>
                        </div>
                    </div>
                </div>
                <div className={`mt-[94px] w-full rounded-[24px] px-[32px] max-md:px-4 pt-[32px] ${isDarkMode ? "bg-[#1F1F1F]" : "bg-[#F5F6FC]"} overflow-x-auto mr-[40px] mx-[32px]  `}>
                    <div className="flex max-lg:flex-col gap-x-2 justify-between items-center">
                        <h3 className={`font-semibold text-[24px]  text-center ${isDarkMode ? "text-[#E7E7E7]" : "text-[#3d457c]"}`}>Выплаты</h3>
                        {/* lazim */}
                        <div className="flex max-lg:flex-col items-center">
                            <div className="relative max-lg:my-3 max-md:hidden ">
                                <input type="text" placeholder='Поиск' style={{ color: isDarkMode ? "#fff" : "#616E90" }} className={`border  ${isDarkMode ? "border-[#D9D9D940]" : "border-[#C5C7CD]"}   bg-transparent   pl-7 placeholder:text-[#616E90] placeholder:font-medium placeholder:text-xs  relative min-w-[252px] py-[3px] mr-[15px] rounded-[8px] outline-none `} />
                                <div className="flex items-center top-[3px] absolute">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="#616E90" className='m-[6px]' xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.1419 14L8.02728 8.88525C7.62011 9.22143 7.15187 9.48452 6.62256 9.67453C6.09324 9.86454 5.54567 9.95955 4.97984 9.95955C3.58802 9.95955 2.41008 9.47767 1.44605 8.51392C0.482017 7.55018 0 6.37253 0 4.98099C0 3.58959 0.481881 2.41154 1.44564 1.44684C2.40941 0.482281 3.58707 0 4.97862 0C6.37005 0 7.54811 0.482009 8.51283 1.44603C9.4774 2.41005 9.95969 3.58796 9.95969 4.97977C9.95969 5.56133 9.86211 6.11677 9.66694 6.64608C9.47163 7.17538 9.21111 7.63575 8.88538 8.02716L14 13.1417L13.1419 14ZM4.97984 8.73827C6.02911 8.73827 6.91782 8.37413 7.64597 7.64586C8.37425 6.91772 8.73839 6.02902 8.73839 4.97977C8.73839 3.93052 8.37425 3.04183 7.64597 2.31369C6.91782 1.58541 6.02911 1.22128 4.97984 1.22128C3.93058 1.22128 3.04187 1.58541 2.31372 2.31369C1.58544 3.04183 1.22129 3.93052 1.22129 4.97977C1.22129 6.02902 1.58544 6.91772 2.31372 7.64586C3.04187 8.37413 3.93058 8.73827 4.97984 8.73827Z" fill="#616E90" />
                                    </svg>
                                </div>
                            </div>
                            <button className='text-[#2D54DD] text-[14px]  font-normal border-[#2D54DD] border-2 px-[24px] rounded-[8px] py-[8px]'>Скачать отчет</button>
                        </div>
                    </div>
                    <div className="flex max-md:justify-center flex-wrap py-[24px] text-[14px] gap-2 text-[#717380]">
                        <input onChange={(e) => setMerchant(e.target.value)} placeholder='Мерчант' type="text" className={` h-[40px] w-[157.5px] pl-[12px] rounded-[4px] ${isDarkMode ? "bg-[#121212]  text-[#E7E7E7]" : "bg-[#DFDFEC]"} `} />
                        <input onChange={(e) => setTrader(e.target.value)} placeholder='Трейдер' type="text" className={` pl-[12px] w-[157.5px] h-[40px] rounded-[4px] ${isDarkMode ? "bg-[#121212]   text-[#E7E7E7]" : "bg-[#DFDFEC]"} `} />
                        <select onChange={(e) => setSelectMethod(e.target.value)} className={`${isDarkMode ? "bg-[#121212]  text-[#E7E7E7]" : "bg-[#DFDFEC]"} pl-[12px] outline-none rounded-[4px] min-w-[157.5px] h-[40px]`} name="" id="">
                            <option value="" selected>Метод</option>
                            {[...new Set(methods)].map(item => (
                                <option key={item}>{item}</option>
                            ))}
                        </select>
                        <select onChange={(e) => setSelectStatus(e.target.value)} className={`${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} pl-[12px] outline-none rounded-[4px] min-w-[157.5px] h-[40px]`} name="" id="">
                            <option selected value={""} >Статус</option>
                            <option value={"wait_confirm"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Успешно</option>
                            <option value={"pending"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>В обработке</option>
                            <option value={"canceled"} className={`${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC] text-black"}`}>Отклонено</option>
                        </select>
                        <div className={`flex items-center pl-[12px] rounded-[4px] min-w-[157.5px] h-[40px] ${isDarkMode ? "bg-[#121212] placeholder:text-[#E7E7E7] text-[#E7E7E7]" : "bg-[#DFDFEC]"} cursor-pointer`} onClick={() => startDateRef.current && startDateRef.current.showPicker()}>
                            <svg width="24" height="24" className='' viewBox="0 0 24 24" fill={`${isDarkMode ? "#E7E7E7" : "#252840"}`} xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 3H19V2C19 1.45 18.55 1 18 1C17.45 1 17 1.45 17 2V3H7V2C7 1.45 6.55 1 6 1C5.45 1 5 1.45 5 2V3H4C2.9 3 2 3.9 2 5V21C2 22.1 2.9 23 4 23H20C21.1 23 22 22.1 22 21V5C22 3.9 21.1 3 20 3ZM19 21H5C4.45 21 4 20.55 4 20V8H20V20C20 20.55 19.55 21 19 21Z" />
                            </svg>
                            <input ref={startDateRef} type="date" name="" id="date-picker" min="2023-01-01" className='bg-transparent outline-none relative mt-1 ml-1 w-full cursor-pointer' onChange={(e) => setStartDate(e.target.value)} defaultValue={"2024-10-16"} />
                        </div>

                        <div className={`flex items-center pl-[12px] rounded-[4px] w-[157.5px] relative h-[40px] ${isDarkMode ? "bg-[#121212] " : "bg-[#DFDFEC]"}`}>
                            <div className="">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className='absolute top-2' xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11.78 7H11.72C11.32 7 11 7.32 11 7.72V12.44C11 12.79 11.18 13.12 11.49 13.3L15.64 15.79C15.98 15.99 16.42 15.89 16.62 15.55C16.83 15.21 16.72 14.76 16.37 14.56L12.5 12.26V7.72C12.5 7.32 12.18 7 11.78 7Z" fill="#717380" />
                                </svg>
                            </div>
                            <input value={time} onChange={handleStartTimeChange} type="text" className='bg-transparent outline-none pl-7' placeholder='00:00' />
                        </div>


                    </div>
                    <DataTable value={filteredCustomers || data.results} paginator rows={8} tableStyle={{ minWidth: '50rem' }} className={`${isDarkMode ? "dark_mode" : "light_mode"} `}>
                        <Column body={(rowData) => {
                            return (
                                <div className='flex gap-x-[10px]'>

                                    <div onClick={() => { handleShow(rowData); setModal(true); setId(rowData.id) }} className='cursor-pointer'>
                                        <img className='mx-auto' src='/assets/img/ion_eye.svg' />
                                    </div>
                                    {rowData.receipts.length > 0 &&
                                        <div onClick={() => { handleShow(rowData); setZoom(!zoom) }} className="cursor-pointer">
                                            <img className='mx-auto' src='/assets/img/Group.svg' />
                                        </div>
                                    }

                                    <div onClick={() => { handleShow(rowData); setModal(true); setCancelCheck(!cancelCheck); setId(rowData.id) }} className="cursor-pointer">
                                        <img className='mx-auto' src='/assets/img/Connect.svg' />
                                    </div>
                                </div>
                            );
                        }} headerStyle={{ backgroundColor: '#D9D9D90A', color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px] ' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="name" header="Действия" ></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 8px", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="method" header=" ID " body={(rowData) => <div>{rowData.id}</div>} ></Column>

                        <Column body={(rowData) => {
                            return (
                                <div>
                                    <div>
                                        <h5>{rowData?.created_at?.split("T")[0]} {rowData?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}/</h5>
                                        <h5>{rowData?.updated_at?.split("T")[0]} {rowData?.updated_at?.split("T")[1].split("+")[0].slice(0, 5)}</h5>
                                    </div>
                                </div>
                            )
                        }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="time" header="Дата и время создания / обновления"  ></Column>


                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="amount_in_usdt" header={"Мерчант"} headerClassName={`${isDarkMode ? "sortable-column_dark" : "sortable-column"} `} body={(rowData) => {
                            return (
                                <div>
                                    <>
                                        <div>{rowData.merchant["username"]}</div>
                                    </>
                                </div>
                            )

                        }} ></Column>

                        <Column body={(rowData) => {
                            return (
                                <div>
                                    <>
                                        <div>{rowData.trader ? rowData.trader["username"] : "-"}</div>
                                    </>
                                </div>
                            )

                        }} headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="course" header="Трейдер" ></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="price_2" header="Назначенный трейдер" body={(rowData) => {
                            return (
                                <div>
                                    <>
                                        <div>{rowData.selected_traders.length > 0 ? rowData.selected_traders.map((person, index) => <p key={index}>{person.username}{index !== rowData.selected_traders.length - 1 && ','}</p>) : "-"}</div>
                                    </>
                                </div>
                            )

                        }} ></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} body={(rowData) => {
                            return (
                                <div>
                                    <div>{rowData.bank} Банк</div>
                                </div>
                            )

                        }} field="code" header="Банк" ></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Метод" body={(rowData) => {
                            return <div>{rowData.method["name"]}</div>
                        }}></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Ставка мерчанта " body={(rowData) => {
                            return (<div>{rowData.merchant_rate}</div>)
                        }}></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Ставка трейдера" body={(rowData) => {
                            return (<div>{rowData.trader_rate}</div>)
                        }}></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Сумма" body={(rowData) => {
                            return (<div>{rowData.amount}</div>)

                        }}></Column>

                        <Column headerStyle={{ backgroundColor: '#D9D9D90A', padding: "16px 0", color: isDarkMode ? "#E7E7E7" : "#2B347C", fontSize: "12px", borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} ` }} className='text-[14px] py-[27px]' bodyStyle={{ borderBottom: `1px solid ${isDarkMode ? "#717380" : "#D9D9D9"} `, color: isDarkMode ? "#E7E7E7" : "#2B347C" }} field="status" header="Статус" body={(rowData) => {
                            if (rowData.status === "pending") {
                                return (
                                    <div className='bg-[#FFC107] flex justify-center mx-auto text-[12px]  w-[116px]  font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                        В обработке
                                    </div>
                                );
                            } else if (rowData.status == "wait_confirm") {
                                return (
                                    <div className='bg-[#37B67E]  flex justify-center mx-auto text-[12px]  w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                        Успешно
                                    </div>
                                )
                            } else {
                                return (
                                    <div className='bg-[#CE2E2E] flex  justify-center mx-auto text-[12px]  w-[116px] font-medium text-white py-[4px] pl-[23px] rounded-[100px] pr-[21px]'>
                                        Отклонено
                                    </div>
                                )
                            }
                        }}></Column>
                    </DataTable>
                    <p className={` text-[14px] font-normal absolute bottom-[43px] mr-4 max-[450px]:bottom-3 left-1/2  duration-300 ${isDarkMode ? "text-[#fff]" : "text-[#252840]"} z-20 `}><input type='number' defaultValue={1} onInput={(e) => {
                        if (e.target.value > Math.ceil(data.count / 10)) {
                            e.target.value = Math.ceil(data.count / 10)
                        } if (e.target.value < 0) {
                            e.target.value = 1;
                        }
                        setPage(e.target.value);
                    }} max={12} className='bg-transparent rounded-lg text-center border h-[32px] w-[35px]' /> из {Math.ceil(data.count / 10)}</p>
                    <p className={`min-[450px]:text-right text-[14px] font-normal relative bottom-[43px] mr-4 max-[450px]:bottom-3  duration-300 ${isDarkMode ? "text-[#FFFFFF33]" : "text-[#252840]"}`}>{data.results ? (!filteredCustomers ? data.results.length : filteredCustomers.length) : 0} результата</p>
                    <div className={`${(!modal) && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>
                    <div className={`${(!modalChek) && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>
                    <div className={`${(!zoom) && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>

                    {/* cek tam ekran */}
                    <div>
                        {details?.map((img, index) => {
                            return (
                                zoom &&
                                <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30'>
                                    {img.receipts.map(img => {
                                        return (
                                            <div className='relative'>
                                                <img className='mx-auto' src={`${img}`} />
                                                <svg onClick={() => setZoom(!zoom)} width="14" height="15" viewBox="0 0 14 15" className='absolute top-0 right-[-20px] cursor-pointer' xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" fill="#000" />
                                                </svg>
                                            </div>
                                        )
                                    })}
                                </div>

                            )
                        })}
                    </div>

                    <div className={`${!modal ? "hidden" : ""}  ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} rounded-[24px] z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full max-w-[784px] ${!cancelCheck ? "overflow-y-scroll h-[100vh]" : ""} custom-scroll`}>
                        <div className="p-8 ">
                            <div className="">
                                <div className="mb-8 relative">
                                    <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Детали пополнения</h3>
                                    <svg width="14" onClick={() => setModal(false)} height="15" className={`${isDarkMode ? "fill-white" : "fill-black"} absolute cursor-pointer top-0 right-0`} viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                    </svg>
                                    <h5 className='text-[14px] text-[#60626C]'>Подробная информация</h5>
                                </div>
                                {details?.map((data, index) => (
                                    <div key={index} className='grid grid-cols-2 '>
                                        <div className="">
                                            <div className="modal_payout ">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>ID</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.id} </p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Назначенный трейдер</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.trader ? data.trader["username"] : "-"}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Мерчант </h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.merchant ? data.merchant["username"] : "-"}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Получатель</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>-</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Метод оплаты</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.method["name"]}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Ставка мерчанта</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.merchant_rate}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Ставка трейдера</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.trader_rate}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Внешний ID</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.outter_id}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сумма</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.amount}</p>
                                            </div>

                                        </div>
                                        <div className="">
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Статус</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.status === "pending" ? "В обработке" : data?.status === "wait_confirm" ? "Успешно" : "Отклонено"}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Трейдеры на выбор</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data.selected_traders.length > 0 ? data.selected_traders.map((person, index) => <span key={index}>{person.username}{index !== data.selected_traders.length - 1 && ','}</span>) : "-"}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Банк</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.bank} Банк</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сумма с учетом ставки трейдера </h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.trader_amount_with_rate}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Сумма с учетом ставки мерчанта</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.merchant_amount_with_rate}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Время создания</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.created_at?.split("T")[0]} {data?.created_at?.split("T")[1].split("+")[0].slice(0, 5)}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Время обновления</h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.updated_at?.split("T")[0]} {data?.updated_at?.split("T")[1].split("+")[0].slice(0, 5)}</p>
                                            </div>
                                            <div className="modal_payout">
                                                <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Реквизиты </h5>
                                                <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}>{data?.requisite} </p>
                                            </div>
                                            {data.receipts.length > 0 &&
                                                <div className="modal_payout">
                                                    <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Чек </h5>
                                                    <p className={`${isDarkMode ? "text-[#B7B7B7]" : "text-[#313237]"}`}><img className='w-[200px] h-[130px] object-cover' src={`${data?.receipts}`} /> </p>
                                                </div>
                                            }

                                        </div>

                                    </div>
                                ))}
                                {/* cancel modal */}
                                <div className={`${!cancel && "hidden"} fixed inset-0 h-[120vh] bg-[#2222224D] z-20`}></div>
                                <form onSubmit={handleCancel} className={`${!cancel ? "hidden" : ""}  ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} p-8 z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full rounded-[24px]`}>
                                    <div className="relative mb-8">
                                        <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Отклонить выплату</h3>
                                        <svg width="14" onClick={() => setCancel(!cancel)} height="15" className={`${isDarkMode ? "fill-white" : "fill-black"} absolute cursor-pointer top-0 right-0`} viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                        </svg>
                                        <h5 className='text-[14px] text-[#60626C]'>Укажите причину</h5>
                                    </div>
                                    <div className="modal_payout mb-8">
                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} mb-2`}>Описание</h5>
                                        <input onChange={(e) => setReason(e.target.value)} placeholder='Описание' type="text" required className={`${isDarkMode ? "text-white" : ""} bg-transparent border placeholder:text-[14px] border-[#6C6E86] w-full py-[10px] px-4 outline-none rounded-[4px]`} />
                                    </div>
                                    <div className="mb-8">
                                        <button className='text-[#2E70F5] border-[#2E70F5] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                            Прикрепить файл
                                        </button>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type='submit' className=' bg-[#2E70F5] text-[#fff] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                            Отклонить
                                        </button>
                                    </div>
                                </form>

                                {/* cek yuklemek ucun */}
                                <div className={`${!cancelCheck && "hidden"} fixed inset-0 bg-[#2222224D] z-20`}></div>

                                <div className={`${!cancelCheck ? "hidden" : ""}  ${isDarkMode ? "bg-[#272727]" : "bg-[#F5F6FC]"} p-8 z-30 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto w-full rounded-[24px]`}>
                                    <div className="relative mb-8">
                                        <h3 className={`text-[32px] ${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"}`}>Завершить</h3>
                                        <svg width="14" onClick={() => setCancelCheck(!cancelCheck)} height="15" className={`${isDarkMode ? "fill-white" : "fill-black"} absolute cursor-pointer top-0 right-0`} viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.4 14.5L0 13.1L5.6 7.5L0 1.9L1.4 0.5L7 6.1L12.6 0.5L14 1.9L8.4 7.5L14 13.1L12.6 14.5L7 8.9L1.4 14.5Z" />
                                        </svg>
                                        <h5 className='text-[14px] text-[#60626C]'>Заполните информацию</h5>
                                    </div>
                                    <div className="modal_payout mb-8">
                                        <h5 className={`${isDarkMode ? "text-[#E7E7E7]" : "text-[#18181B]"} mb-2`}>Чек</h5>
                                        <button
                                            className='text-[#2E70F5] border-[#2E70F5] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'
                                            onClick={() => document.getElementById('fileInput').click()}
                                        >
                                            Прикрепить Чек
                                        </button>
                                        <input
                                            id="fileInput"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => console.log(e.target.files[0])}
                                        />
                                    </div>
                                    <div className=" flex items-center">
                                        <img className='' src="https://s3-alpha-sig.figma.com/img/613a/5e86/0ae75619ed18b69de8fd2a3572f8a9bd?Expires=1730678400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=QgRbKZ7j1eGcDCI7tdJmaxOjSXd7Bfw83YxDLogkh7AmrFoj8iPfIbDWxKjckZjIuFYLFOtdKR8CGTq~v2LvZLy1kMKuG-cyqOeBFyJGXP5C2dUNiUNTF2scTo-XJESCeCJ-y18uEXKA77RFSifFIa00Y2L9v08sqoelMxWKYpnm0Vc8flgdS4OKrcK1wqIJdQRX2jV2AdMvKdD2Yb0UadrMAgOk~czxVNERBhcCjO4O5vv7jPm99CXalRyZCtILQVbfdbmevhaMf3bca5gYVRQKEDsrNSptEgC5kpltvV1HbXb~hTdWqMBct0hVUjDcy4knWefAaCQsQ54D~mMVFw__" alt="" />
                                        <svg width="24" className='ml-3 cursor-pointer' height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9C18 7.9 17.1 7 16 7H8C6.9 7 6 7.9 6 9V19ZM18 4H15.5L14.79 3.29C14.61 3.11 14.35 3 14.09 3H9.91C9.65 3 9.39 3.11 9.21 3.29L8.5 4H6C5.45 4 5 4.45 5 5C5 5.55 5.45 6 6 6H18C18.55 6 19 5.55 19 5C19 4.45 18.55 4 18 4Z" fill="#CE2E2E" />
                                        </svg>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={() => setCancel(!cancel)} className=' bg-[#2E70F5] text-[#fff] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                            Завершить
                                        </button>
                                    </div>
                                </div>

                                <div className="flex w-full text-white justify-end gap-x-4">
                                    {details?.map((data, index) => {
                                        return (
                                            data.status === "pending" &&
                                            <>
                                                <button onClick={() => setCancel(!cancel)} className='text-[#2E70F5] border-[#2E70F5] border px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                    Отклонить
                                                </button>
                                                <button className='bg-[#2E70F5] px-[37.5px] py-[10px] font-normal text-[14px] rounded-[8px]'>
                                                    Взять в работу
                                                </button>
                                            </>

                                        )
                                    })}

                                </div>
                            </div>

                        </div>
                    </div>


                </div>

            </div>
        </div>
    )
}

export default Dashboard