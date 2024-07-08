async function paynow(orderId)
{
    fetch('/repayment-razorpay',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({orderId})
    }).then((res)=>{
        console.log("responce",res)

        if(res.redirected)
            window.location.href= res.url;
        else if(!res.ok)
            return res.json().then(err => { throw new Error(err.message); });
        return res.json();
    }).then((data)=>{
            
            if (data.orderID) {
                const options = {
                    "key": "rzp_test_1CXfduMW9euDd9",
                    "amount": data.totalPrice * 100,
                    "currency": "INR",
                    "name": "PURE QOQO",
                    "order_id": data.orderID,
                    "prefill": {
                        "name": "",
                        "email": "",
                        "contact": ""
                    },
                    "notes": {
                        "address": "Razorpay Corporate Office"
                    },
                    "theme": {
                        "color": "#6351CE"
                    },
                    "handler": function (response) {
                        // Handle successful payment here
                        fetch('/retry-payment-success',{
                            method:'POST',
                            headers:{'Content-Type':'application/json'},
                            body: JSON.stringify({orderId})
                        }).then((res)=>{
                            if(res.ok)
                            {
                                Swal.fire({
                                    position: "center",
                                    icon: "success",
                                    title: "Order Placed Sucessfully",
                                    showConfirmButton: false,
                                    timer: 3000
                                  });
                                  window.location.href='/orders'
                            }
                        })
                    },
                    "modal": {
                        "ondismiss": function () {
                            console.log("Payment failed or was dismissed.");
                            
                        }
                    }
                };

                const rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', async function (response){
                  document.getElementById('paymentStatus').value = 'failed'
                  document.getElementById('check-out-form').submit();
                })
                rzp1.open();
            }else {
                            throw new Error("Order ID not received");
                        }
    }).catch((err)=> console.log(err))
}