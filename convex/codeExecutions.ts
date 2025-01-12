import {mutation} from "./_generated/server";
import {ConvexError, v} from "convex/values";


export const saveExecution = mutation({
    args:{
        code:v.string(),
        language:v.string(),
        error:v.optional(v.string()),
        output:v.optional(v.string())

    },
    handler:async (ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("User must be authenticated");

        //check user subscription

        const user =await ctx.db.query("users")
            .withIndex("by_user_id")
            .filter((q)=>q.eq(q.field("userId"),identity.subject))
            .first();

        if(!user?.isPro && args.language!=='javascript'){
            throw new ConvexError("Pro subscription is required to perform this action ");


        }

        // save code into convex
        await ctx.db.insert("codeExecution",{
            ...args,
            userId:identity.subject
        });

    }
})