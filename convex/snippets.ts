import {mutation, query} from "./_generated/server";
import {ConvexError, v} from "convex/values";


export const createSnippet  = mutation({
    args:{
        title:v.string(),
        language:v.string(),
        code:v.string(),

    },
    handler:async (ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw  new ConvexError("Unauthorized access!");

        const user = await ctx.db.query("users")
            .withIndex("by_user_id")
            .filter((q)=>q.eq(q.field("userId"),identity.subject))
            .first();

        if(!user) throw new ConvexError("User not found");

        const snippetId = await ctx.db.insert("snippets",{
            userId:identity.subject,
            userName: user.name,
            ...args

        });

        return snippetId;


    },


})

export const deleteSnippet=mutation({
    args:{
        snippetId:v.id("snippets")
    },
    handler:async (ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("Unauthorized access!");

        const snippet = await ctx.db.get(args.snippetId);

        if(!snippet) throw new ConvexError("Snippet not found!");

        if(snippet.userId !== identity.subject) throw new ConvexError("Unauthorized you can't delete this snippet");

        // delete all snippet commands

        const snippetCommands = await ctx.db.query("snippetComments")
            .withIndex("by_snippet_id")
            .filter((q)=>q.eq(q.field("snippetId"),args.snippetId))
            .collect();

        for(const command of snippetCommands ){
            await ctx.db.delete(command._id);
        }

        // delete all stars

        const stars = await ctx.db.query("stars")
            .withIndex("by_snippet_id")
            .filter((q)=>q.eq(q.field("snippetId"),args.snippetId))
            .collect();

        for(const star of stars){
            await ctx.db.delete(star._id);
        }

        await ctx.db.delete(args.snippetId);


    }
})

export const starSnippet  = mutation({
    args:{snippetId:v.id("snippets")},
    handler:async(ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("Unauthorized access!");

        const stars = await ctx.db.query("stars")
            .withIndex("by_user_id_and_snippet_id")
            .filter((q)=>q.eq(q.field("userId"),identity.subject) &&
            q.eq(q.field("snippetId"),args.snippetId)
            ).first();

        if(stars){
            await  ctx.db.delete(stars._id);
        }else{
            await ctx.db.insert("stars",{
                userId:identity.subject,
                snippetId: args.snippetId
            })
        }
    }
})

export const addComment = mutation({
    args:{snippetId:v.id("snippets"),content:v.string()},
    handler:async (ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("Unauthorized access!");

        const user = await ctx.db.query("users")
            .withIndex("by_user_id")
            .filter((q)=>q.eq(q.field("userId"),identity.subject))
            .first();

        if(!user) throw  new ConvexError("User not found!");

       return  await ctx.db.insert("snippetComments",{
            userId: user.userId,
            userName: user.name,
            snippetId: args.snippetId,
            content: args.content
        })
    }
})

export const deleteComment = mutation({
    args:{commentId:v.id("snippetComments")},
    handler:async (ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("Unauthorized access!");

        const comment = await ctx.db.get(args.commentId);

        if(!comment) throw  new ConvexError("Comment not found!");

        if(identity.subject !== comment.userId) throw new ConvexError("Unauthorized access! you are not the owner of the comment");


        await ctx.db.delete(args.commentId);
    }
})

export const getSnippets = query({
    handler: async (ctx)=>{
  const snippets= await ctx.db.query("snippets").order("desc").collect();

        return snippets;
    }
})

export const getSnippetById=query({
    args:{snippetId:v.id("snippets")},
    handler:async (ctx,args)=>{
        const snippet = await ctx.db.get(args.snippetId);
        if(!snippet) throw new ConvexError("Not found!");

        return snippet;
    }
})

export const getComments = query({
    args:{snippetId:v.id("snippets")},
    handler:async (ctx,args)=>{
        const commands = await ctx.db.query("snippetComments")
            .withIndex("by_snippet_id")
            .filter((q)=>q.eq(q.field("snippetId"),args.snippetId))
            .order("desc")
            .collect();

        return commands;
    }
})

export const isSnippetStarred = query({
    args:{snippetId:v.id("snippets")},
    handler: async (ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("Unauthorized access!");

        const star = await ctx.db.query("stars")
            .withIndex("by_user_id_and_snippet_id")
            .filter((q)=>q.eq(q.field("userId"),identity.subject) && q.eq(q.field("snippetId"),args.snippetId))
            .first();

        return !!star;
    }
})

export const getSnippetStarCount = query({
    args:{snippetId:v.id("snippets")},
    handler:async (ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("Unauthorized access!");

        const stars = await ctx.db.query("stars")
            .withIndex("by_snippet_id")
            .filter((q)=>q.eq(q.field("snippetId"),args.snippetId))
            .collect();

        return stars.length;
    }
})

export const getStarredSnippets = query({
    handler:async (ctx)=>{
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) throw new ConvexError("Unauthorized access!");

        const stars = await ctx.db.query("stars")
            .withIndex("by_user_id")
            .filter((q)=>q.eq(q.field("userId"),identity.subject))
            .collect();

        const snippets =await Promise.all(stars.map(star=>ctx.db.get(star.snippetId)));

        return snippets.filter(snippet => snippet !==null);


    }
})