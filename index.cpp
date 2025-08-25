#include <iostream>
#include <string>
using namespace std;

// Function to check if the phone number is valid
bool isValid(string num) {
    string ans = "";
    int i = 0;

    // Check prefix
    if (num.substr(0, 3) == "+91") {
        i = 3;
        if (num.length() > 3 && num[i] == ' ') i++;
    } else if (num[0] == '0') {
        i = 1;
    }

    // Collect digits only
    int count = 0;
    for (; i < num.length(); i++) {
        if (num[i] == ' ') continue;
        if (num[i] < '0' || num[i] > '9') return false;
        ans += num[i];
        count++;
    }

    // Must be exactly 10 digits
    if (count != 10) return false;

    // Must start with 7, 8, or 9
    if (ans[0] < '7' || ans[0] > '9') return false;

    return true;
}

int main() {
    int n;
    cin >> n;
    cin.ignore(); // consume newline

    for (int i = 0; i < n; i++) {
        string num;
        getline(cin, num); // read full line including spaces
        if (isValid(num))
            cout << "True" << endl;
        else
            cout << "False" << endl;
    }

    return 0;
}
