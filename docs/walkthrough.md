# A handoff receipt in four states

Choose Try demo. Hashfolio generates three tiny File objects locally:
stable.txt contains abc, changed.txt contains new, and new.txt contains hello.
The previous snapshot instead has changed.txt containing old and a missing.txt
entry containing gone. No demo file contents are fetched from the network.

The comparison should show:
- stable.txt: MATCH
- changed.txt: CHANGED
- missing.txt: MISSING
- new.txt: NEW

The current snapshot is in [current-snapshot.json](../examples/current-snapshot.json),
the previous one in [baseline.json](../examples/baseline.json), and the full report
in [comparison.json](../examples/comparison.json).
[SHA256SUMS](../examples/SHA256SUMS) demonstrates the standard text-mode export.

The stable file's SHA256 is the published abc test vector:
ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad

Clear the baseline and run again to create a standalone snapshot without
classifying all files as new. Editing the baseline hides old results, and invalid
JSON rejects the operation before reading file contents.
