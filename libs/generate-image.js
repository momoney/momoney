'use strict';

const graphicsMagick = require('gm').subClass({imageMagick: true});

module.exports = function(contribution) {
  console.log("generate-image called");
  return new Promise((resolve, reject) => {
    const text = {
      amount: contribution.amount,
      amountInText: genAmountInText(contribution),
      contributor: genContributor(contribution),
      date: contribution.contribution_date,
      forLine: contribution.campaign.name + " - " + contribution.monetary_in_kind,
      to: genName(contribution),
      routing: genRouting(contribution)
    };

    graphicsMagick("original.jpg")
    
      .font('./fonts/micr-encoding.ttf', 30)
      .drawText(65, 345, text.routing)
      
      .font('./fonts/georgia.ttf', 15)
      .drawText(40, 40, text.contributor.line1)
      .drawText(40, 60, text.contributor.line2)
      .drawText(40, 80, text.contributor.line3)
      .drawText(40, 100, text.contributor.line4)
      
      .font('./fonts/king.ttf', 14)
      .drawText(645, 153, text.amount)
      .drawText(125, 153, text.to)
      .drawText(60, 195, text.amountInText)
      .drawText(80, 293, text.forLine)
      .drawText(500, 94, text.date)
      
      .toBuffer('PNG', function(err, buffer) {
        console.log("toBuffer called");

        if (err) 
          reject(err);
        else
          resolve(buffer);
      });
  });
}

function amountToString(amount) {
  var th = ['','thousand','million', 'billion','trillion'];
  var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine']; 
  var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen'];
  var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety']; 

  function toWords(s) {  
    s = s.toString(); 
    s = s.replace(/[\, ]/g,''); 
    if (s != parseFloat(s)) return 'not a number'; 
    var x = s.indexOf('.'); 
    if (x == -1) x = s.length; 
    if (x > 15) return 'too big'; 
    var n = s.split(''); 
    var str = ''; 
    var sk = 0; 
    for (var i=0; i < x; i++) {
      if ((x-i)%3==2) {
        if (n[i] == '1') {
          str += tn[Number(n[i+1])] + ' '; 
          i++; 
          sk=1;
        } else if (n[i]!=0) {
          str += tw[n[i]-2] + ' ';
          sk=1;
        }
      } else if (n[i]!=0) {
        str += dg[n[i]] +' '; 
        if ((x-i)%3==0) str += 'hundred ';
        sk=1;
      }

      if ((x-i)%3==1) {
        if (sk) str += th[(x-i-1)/3] + ' ';
        sk=0;
      }
    }
    if (x != s.length) {
      var y = s.length; 
      str += 'point '; 
      for (var i=x+1; i<y; i++) str += dg[n[i]] +' ';
    }

    return str.replace(/\s+/g,' ');
  }

  var amountInText = toWords(amount).trim();
  return amountInText.charAt(0).toUpperCase() + amountInText.slice(1);
}

function genAmountInText(contribution) {
  var amountArr = contribution.amount.split('.');
  var amount = amountArr[0].replace('$', '').replace(/\,/, '')

  var dollars = amountToString(amount),
      cents   = amountArr[1] === "00" ? "zero" : amountToString(amountArr[1]);

  return [dollars, "dollars and", cents, "cents"].join(' ');
}

function genName(contribution) {
  var name, party;

  if (contribution.campaign.type == "Candidate") {
    name = contribution.campaign.candidate_name;
    if (contribution.campaign.office !== "Statewide Office") {
      party = ("party" in contribution.campaign && contribution.campaign.party) ? (contribution.campaign.party == "Democrat" ? "Democratic " : contribution.campaign.party+" ") : "";
      name = name + " - " + party + "Candidate for " + contribution.campaign.office.split('  ')[0];
    }
  } else {
    name = contribution.campaign.name;
  }
  
  return name.replace("Representative","Rep.").replace("Senator","Sen.").replace("District ", "#");
}

function genContributor(c) {
  var contributor = {
    line1: c.contributor.replace(/  /, " ")
  };

  var address = c.address.split(", ");
  var line2;
  
  c.occupation = c.occupation.trim();
  c.employer = c.employer.trim();

  if (c.hasOwnProperty("occupation") && c.occupation)
    line2 = c.occupation;
  if (c.hasOwnProperty("employer") && c.employer)
    line2 += ", "+c.employer;

  if (line2) {
    contributor.line2 = line2;
    contributor.line3 = address[0];
    contributor.line4 = [address[1], address[2]].join(", ");
  }
  else {
    contributor.line2 = address[0];
    contributor.line3 = [address[1], address[2]].join(", ");
    contributor.line4 = "";
  }

  return contributor;
}

function genRouting(contribution) {
  var routingNumbers;

  if (contribution.hasOwnProperty('location')) {
    var lat = contribution.location.lat.toString().replace('.', '').replace('-', '').substring(0, 9),
        lng = contribution.location.lng.toString().replace('.', '').replace('-', '').substring(0, 9);

    routingNumbers = ['a', parseInt(lat), 'a ', parseInt(lng), ' ', contribution.mecid].join('');
  } else {
    routingNumbers = [
      'a',
      Math.floor(Math.random() * 1000000000),
      'a ',
      Math.floor(Math.random() * 1000000000000),
      'b ',
      contribution.mecid].join('');
  }

  return routingNumbers;
}
