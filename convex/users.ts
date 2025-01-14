import {ConvexError, v} from "convex/values";
import {mutation, query} from "./_generated/server";


export const syncUser = mutation({
args:{
    userId:v.string(),
    email:v.string(),
    name:v.string(),
},
handler: async(ctx, args) => {
    const existingUser = await ctx.db.query("users")
    .filter((q)=>q.eq(q.field("userId"),args.userId))
    .first();

    if(!existingUser) {
        ctx.db.insert("users",{
            userId:args.userId,
            email:args.email,
            name:args.name,
            isPro:false,
        })
    }
},

})

export const upgradeToPro = mutation({
    args: {
        email: v.string(),
        lemonSqueezyCustomerId: v.string(),
        lemonSqueezyOrderId: v.string(),
    },
    handler:async (ctx,args)=>{
        const user = await ctx.db.query("users")
            .filter(q=>q.eq(q.field("email"),args.email))
            .first();

        if(!user) throw new ConvexError("User not found!");

        await ctx.db.patch(user._id,{
            isPro:true,
            lemonSqueezyCustomerId:args.lemonSqueezyCustomerId,
            lemonSqueezyOrderId:args.lemonSqueezyOrderId,
            proSince:Date.now()
        })

        return {success:true};
    }
})

export const getUser = query({
    args:{userId:v.string()},
    handler:async  (ctx,args)=>{
        if(!args.userId) return null;

        const user = await ctx.db.query("users")
            .withIndex("by_user_id")
            .filter((q)=>q.eq(q.field("userId"),args.userId))
            .first();

        if(!user) return null;
        return  user;
    }
})