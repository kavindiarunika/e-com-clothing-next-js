import { getPool } from '@/lib/db';
import { NextResponse } from 'next/server';

const db = getPool();


export async function GET(req) {

// GET - Get all users
    try{

        const [users] =await db.query(
                `
                 SELECT
        user_id,
        first_name,
        last_name,
        email,
        phone,
        whatsapp_number,
        postal_code,
        address_line1,
        address_line2,
        city,
        district,
        role,
        status,
        created_at,
        updated_at
      FROM users
      ORDER BY user_id DESC
                
                
                `
        )

        return response.json(
            {
                success:true,
                data:users
            }
        )



    }
    catch(error){

        return response.json(
            {
                success:false,
                message:error.message
            }
        )

    }


  

    

}


  //add new user

  export async function POST(req){

    try{
         const body =await req.json();

         const {
      first_name,
      last_name,
      email,
      password,
      phone,
      whatsapp_number,
      postal_code,
      address_line1,
      address_line2,
      city,
      district,
    } = body;

    if(!email || !password ){

        return response.json(
        {
          success: false,
          message: "First name, email and password are required",
        },
        { status: 400 }

        )
    }

    //check the email already exists

    const [existingUser] =await db.query(

        "select user_id from users where email = ?",
        [email]
    )

    if(existingUser.length >0){

        return response.json(
            {
                success:false,
                message:"Email already exists"
            },
               { status: 409 }
        )
    }



    }


    catch(error){
        return response.json(
            {
                success:false,
                message:error.message
            },
            { status: 500 }
        )   
    }


    const [result] =await db.query(
        `
            INSERT INTO users (
                first_name,
                last_name,
                email,
                password,
                phone,
                whatsapp_number,
                postal_code,
                address_line1,
                address_line2,
                city,
                district
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            first_name||"",
            last_name||"",
            email,
            password,
            phone||"",
            whatsapp_number||"",
            postal_code ||"",
            address_line1||"",
            address_line2||"",
            city||"",
            district||""
        ]
    )


    return NextResponse.json(
        { 
            success: true,
             message: "User created successfully", 
             data: { user_id: result.insertId,
                 first_name: first_name || "", 
                 last_name: last_name || "",
                  email, phone: phone || "",
                   whatsapp_number: whatsapp_number || "",
                    postal_code: postal_code || "", 
                    address_line1: address_line1 || "", 
                address_line2: address_line2 || "", 
                city: city || "", 
                district: district || "", } },
        { status: 201 }
    )
    
  }



