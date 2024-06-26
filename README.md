This is a modification of Open Spelling Bee that accepts the sourcecode for the day's New York Times Spelling Bee, parsing out the data to produce an offline version for detached play. 
This allows you to play without screwing things up for your spouse who also plays on that same account!

You simply go to a page with a simple form on it, past the entire sourcecode from the day's Spelling Bee (you can get this while the NYT Spelling Bee screen is still yellow, before the words or letters are shown)
and then you just click Play Spelling Bee to play. Even if you don't have a New York Times account, the demo has the info in the source that this version needs to play a complete game.

To see a live version of this (using the PHP instead of the ASP backend), go here:
http://randomsprocket.com/oldspellingbee/

Please note: I absolutely hate this version for multiple reasons.  I chose it because someone had built it, and I wanted to extend what was built.  But it uses some esoteric Javascript framework that requires compilation, and the resulting code doesn't even run on old Chromebooks (which I use).  I also found it impossible to implement keyboard shortcuts (and lord knows I tried).  So I wrote a simpler version from scratch using no frameworks, just straightforward, easy-to-read vanilla Javascript. It fits into only 12k of code and will run on your Commodore 64 I think.  Check that out here:  https://github.com/judasgutenberg/simple_spelling_bee

