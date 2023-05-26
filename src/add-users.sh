#!/bin/bash

show_help() {
  echo "Usage: $0 -f <csv_file> -i <ip_address>"
  echo ""
  echo "Options:"
  echo "  -f <csv_file>     Specify the CSV file containing user data."
  echo "  -i <ip_address>   Specify the IP address of the server."
  echo ""
  echo "CSV File Format:"
  echo "UserID,Password,IconURL"
  echo "Test1,Maixuo7p,https://example.com/1.jpg"
  echo "Test2,eoch2ieP,https://example.com/2.jpg"
}

while getopts "f:i:h" opt; do
  case ${opt} in
    f )
      CSV_FILE=$OPTARG
      ;;
    i )
      IP_ADDRESS=$OPTARG
      ;;
    h )
      show_help
      exit 0
      ;;
    \? )
      show_help
      exit 1
      ;;
  esac
done

if [ -z "$CSV_FILE" ] || [ -z "$IP_ADDRESS" ]; then
  show_help
  exit 1
fi

tail -n +2 "$CSV_FILE" | while IFS=',' read -r UserID Password IconURL; do
  echo "$UserID will be registered."
  curl "https://$IP_ADDRESS/api/signup" \
    -H 'Content-Type: application/json' \
    --data-raw "{\"userID\":\"$UserID\",\"password\":\"$Password\",\"iconURL\":\"$IconURL\"}" \
    --insecure
    echo
    echo
done
