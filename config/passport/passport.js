const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const db = require("../../models");

const jwtOption = {
   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
   secretOrKey: process.env.SECRET,
};

const JWTStrategy = new Strategy(jwtOption, async (payload, done) => {
   const targetUser = await db.User.findOne({
      where: {
         id: payload.id,
      },
   });

   if (targetUser) {
      done(null, targetUser);
   } else {
      done(null, false);
   }
});

passport.use("jwt", JWTStrategy);
