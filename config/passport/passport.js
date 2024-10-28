const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const db = require("../../models");

const jwtOption = {
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   secretOrKey: process.env.SECRET,
};

const JWTStrategy = new Strategy(jwtOption, async (payload, done) => {
   const targetUser = await db.Users.findOne({
      where: {
         user_id: payload.id,
      },
   });

   if (targetUser) {
      done(null, targetUser);
   } else {
      done(null, false);
   }
});

passport.use("jwt", JWTStrategy);
