export default () => {
    return (req:any, res:any, next:any) => {
      console.log("Middleware executed");
  
      // Example validation
      if (!req.headers["authorization"]) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
  
      next();
    };
  };


  //Check this for Validations 