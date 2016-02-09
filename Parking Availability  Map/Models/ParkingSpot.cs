using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Parking_Availability_Map.Models
{
    public class ParkingSpot
    {
        public bool IsTaken { get; set; }
        public int Age { get; set; }
        public int History { get; set; }
    }
}