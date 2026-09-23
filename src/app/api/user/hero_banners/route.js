import db from '@lib/db.js'
import { NextResponse } from 'next/server'

// GET - Get all hero banners


export async function GET (req) {


    try{

        const [heroBannerd] = await db.query(
            `
            SELECT 
            * FROM hero_banners   
            `
        )

        return NextResponse.json(
            {
                success:true,
                data:heroBannerd
            }
        )

    }

    catch(error){
        return NextResponse.json(
            {
                success:false,
                message:"Error fetching hero banners"
            }
        )

    }
}