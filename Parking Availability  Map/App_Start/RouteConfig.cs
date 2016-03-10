using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Parking_Availability_Map
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");          

            routes.MapRoute(
               name: "Api",
               url: "Api/{action}/{lot}",
               defaults: new { controller = "Api", action = "GetLot", lot = UrlParameter.Optional }
            );

            routes.MapRoute(
             name: "Default",
             url: "Main/{action}/{param}",
             defaults: new { controller = "Main", action = "Lot", param = UrlParameter.Optional }
          );

            routes.MapRoute(
              name: "Main",
              url: "{action}/{param}",
              defaults: new { controller = "Main", action = "Lot", param = UrlParameter.Optional }
           );
        }
    }
}
