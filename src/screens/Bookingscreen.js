import React, { useEffect , useState } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import StripeCheckout from 'react-stripe-checkout';
import Error from "../components/Error";
import Loader from "../components/Loader";
 
import moment from "moment"
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();
AOS.refresh()
function Bookingscreen({match}) {
    const[loading, setloading]=useState(true);
    const[error]=useState(false)   
    const[room , setroom]=useState()
    const roomid=match.params.roomid
    const fromdate=moment(match.params.fromdate , 'DD-MM-YYYY')
    const todate=moment(match.params.todate,'DD-MM-YYYY')
    const totalDays = moment.duration(todate.diff(fromdate)).asDays()+1
    const [totalAmount , settotalAmount]=useState()
    // eslint-disable-next-line
    useEffect(async() => {
        try {
            setloading(true);
            const data = await (await axios.post("https://room-apis.herokuapp.com/Rooms/getroombyid" , {roomid})).data;
            console.log(data);
            setroom(data);
            setloading(false);
            settotalAmount(data.rentperday * totalDays)
          } catch (error) {
            console.log(error);
            setloading(false);
          }
        // eslint-disable-next-line  
    }, [])


    async function tokenHander(token) {
    
        console.log(token);
        const bookingDetails ={

            token ,
            user : JSON.parse(localStorage.getItem('currentUser')),
            room ,
            fromdate,
            todate,
            totalDays,
            totalAmount

        }


        try {
            setloading(true);
            // eslint-disable-next-line
            const result = await axios.post('https://room-apis.herokuapp.com/Bookings/bookroom' , bookingDetails)
            setloading(false)
            Swal.fire('Congrats' , 'Your Room has booked succeessfully' , 'success').then(result=>{
                window.location.href='/profile'
            })
        } catch (error) {
            console.log(error);
            setloading(false)
            Swal.fire('Oops' , 'Something went wrong , please try later' , 'error')
        }
        
    }

    return (
        <div className='m-5'>
            
            {loading ? (<Loader/>) : error ? (<Error/>) : (

                <div className="row p-3 mb-5 bs" data-aos='flip-right' duration='2000'>

                      <div className="col-md-6 my-auto">
                        
                         <div>
                         <h1> {room.name}</h1>
                           <img src={room.imageurls[0]} style={{height:'400px'}} alt='img'/>
                         </div>

                      </div>
                      <div className="col-md-6 text-right">
                           <div>
                           <h1><b>Booking Details</b></h1>
                           <hr />

                           <p><b>Name</b> : {JSON.parse(localStorage.getItem('currentUser')).name}</p>
                           <p><b>From Date</b> : {match.params.fromdate}</p>
                           <p><b>To Date</b> : {match.params.todate}</p>
                           <p><b>Max Count </b>: {room.maxcount}</p>
                           </div>
                           
                           <div className='mt-5'>
                           <h1><b>Amount</b></h1>
                           <hr />
                           <p>Total Days : <b>{totalDays}</b></p>
                           <p>Rent Per Day : <b>{room.rentperday}</b></p>
                           <h1><b>Total Amount : {totalAmount} /-</b></h1>

            <StripeCheckout
            shippingAddress
            amount={totalAmount *100}
            token={ontoken}
            currency='inr'
            stripeKey='pk_test_51KFsXwSIU6m9yyF3nXJSqrQPZ9LewUM1X0bkkpLXulyJcfI8UmINDGWXP8SiV6AsxTxvvM4wP9Glc1BYCv8KHbYp00VJpx1JeP'
            >
                  <button className='btn btn-primary'>Pay Now</button>
            </StripeCheckout>
                           </div>      
                      </div>

                </div>

            )}
        
        </div>
    )
}

export default Bookingscreen
